import { getFirestore } from "firebase-admin/firestore";
import { waitUntil } from "@vercel/functions";
import { sendOrderConfirmationWhatsApp } from "./whatsappNotify.js";
import { resolveProductRef, adjustProductStock, adjustDhotiStock } from "./stockLedger.js";

// Shared order-creation logic, called from two places:
//  - api/save-order.js: the client-side fast path, called right after Razorpay
//    payment succeeds in the browser.
//  - api/razorpay-webhook.js: the server-to-server safety net, called by
//    Razorpay itself when payment.captured fires - this still creates the
//    order even if the customer's browser/network died right after paying.
// Both paths converge here so behavior never diverges, and this function is
// idempotent on razorpay_order_id so it's safe to be called by both for the
// same order (whichever gets there first wins; the other is a no-op).

// Applies every item's stock consumption as its own atomic transaction (via
// stockLedger.js), stopping at the first failure and rolling back everything
// already applied for this order - so a cart never ends up half-decremented
// just because one item ran out partway through. Previously this only
// checked/decremented sizes XS/S/M; every L/XL/2XL/4XL/6XL/8XL order silently
// skipped stock entirely, which is the main reason stock drifted from reality.
async function applyOrderStockConsumption(db, items, { orderId, orderNumber, customerName, customerPhone }) {
    const applied = [];
    let insufficientStockError = null;

    const rollback = async () => {
        for (const entry of applied.reverse()) {
            try {
                if (entry.kind === "product") {
                    await adjustProductStock(db, {
                        productRef: entry.productRef,
                        size: entry.size,
                        delta: -entry.delta, // undo
                        reason: "order_rollback",
                        orderId,
                        orderNumber,
                        customerName,
                        customerPhone,
                        note: `Rolled back - order failed after partial stock consumption (${entry.failureReason || "unknown reason"})`,
                    });
                } else {
                    await adjustDhotiStock(db, {
                        dhotiId: entry.dhotiId,
                        size: entry.size,
                        delta: -entry.delta,
                        reason: "order_rollback",
                        orderId,
                        orderNumber,
                        customerName,
                        customerPhone,
                        note: `Rolled back - order failed after partial stock consumption (${entry.failureReason || "unknown reason"})`,
                    });
                }
            } catch (rollbackError) {
                // Nothing more we can do here except make it loud - a failed
                // rollback means the ledger and sizeStock need a manual look.
                console.error(
                    `❌ CRITICAL: failed to roll back stock for ${entry.kind} ${entry.productRef?.id || entry.dhotiId} size ${entry.size}:`,
                    rollbackError.message
                );
            }
        }
    };

    for (const item of items) {
        const quantity = item.quantity || 1;

        try {
            const resolved = await resolveProductRef(db, {
                productId: item.productId,
                category: item.category,
                subcategory: item.subcategory,
                type: item.type,
            });
            if (!resolved) {
                throw new Error(`Product ${item.productId} not found in any collection`);
            }

            const { previousStock, newStock } = await adjustProductStock(db, {
                productRef: resolved.ref,
                size: item.selectedSize,
                delta: -quantity,
                reason: "order",
                orderId,
                orderNumber,
                customerName,
                customerPhone,
            });
            applied.push({ kind: "product", productRef: resolved.ref, size: item.selectedSize, delta: quantity });
            console.log(`📦 ${resolved.collectionName}/${item.productId} size ${item.selectedSize}: ${previousStock} -> ${newStock}`);
        } catch (error) {
            console.error(`❌ Stock consumption failed for ${item.productId}:`, error.message);
            insufficientStockError = error;
            break;
        }

        if ((item.isFullSet || item.isRoyalSet) && item.selectedDhoti) {
            try {
                const { previousStock, newStock } = await adjustDhotiStock(db, {
                    dhotiId: item.selectedDhoti,
                    size: item.selectedSize,
                    delta: -quantity,
                    reason: "order",
                    orderId,
                    orderNumber,
                    customerName,
                    customerPhone,
                });
                applied.push({ kind: "dhoti", dhotiId: item.selectedDhoti, size: item.selectedSize, delta: quantity });
                console.log(`🍀 Dhoti ${item.selectedDhoti} size ${item.selectedSize}: ${previousStock} -> ${newStock}`);
            } catch (error) {
                console.error(`❌ Dhoti stock consumption failed for ${item.selectedDhoti}:`, error.message);
                insufficientStockError = error;
                break;
            }
        }
    }

    if (insufficientStockError) {
        applied.forEach((entry) => {
            entry.failureReason = insufficientStockError.message;
        });
        await rollback();
        throw insufficientStockError;
    }

    return applied;
}

async function sendConfirmationEmail(payload) {
    try {
        const { default: sendOrderConfirmation } = await import('../api/send-order-confirmation.js');
        const mockReq = { method: 'POST', body: payload };
        const mockRes = { status: () => ({ json: (data) => data }) };
        await sendOrderConfirmation(mockReq, mockRes);
        console.log("✅ Order confirmation email sent successfully");
    } catch (emailError) {
        console.error("❌ Email service error:", emailError);
    }
}

async function sendConfirmationWhatsApp({ customer, orderNumber, amount }) {
    try {
        await sendOrderConfirmationWhatsApp({
            phone: customer.mobileNumber,
            customerName: customer.fullName,
            orderNumber,
            amount,
        });
    } catch (whatsappError) {
        console.error("❌ WhatsApp service error:", whatsappError);
    }
}

// info: { razorpay_order_id, razorpay_payment_id, customer, items, amount,
//         coupon, dispatchDate, isCollaboration, customCouponId,
//         paymentMethod, codAdvanceAmount, codAmountDue }
// Returns { statusCode, body } - callers translate this into their own res.
export async function createOrderFromPayment(info) {
    const db = getFirestore();
    const {
        razorpay_order_id,
        razorpay_payment_id,
        customer,
        items,
        amount,
        coupon,
        dispatchDate,
        isCollaboration,
        customCouponId,
        paymentMethod,
        codAdvanceAmount,
        codAmountDue,
    } = info;

    if (!razorpay_order_id || !razorpay_payment_id || !customer || !items || !amount) {
        return { statusCode: 400, body: { success: false, message: "Missing required fields" } };
    }

    // Idempotency: the client-side save-order call and the Razorpay webhook
    // can both race to create the same order. Whichever gets here first wins.
    try {
        const existing = await db.collection("orders")
            .where("razorpay_order_id", "==", razorpay_order_id)
            .limit(1)
            .get();
        if (!existing.empty) {
            const doc = existing.docs[0];
            console.log(`ℹ️ Order for ${razorpay_order_id} already exists (${doc.id}), skipping duplicate creation`);
            return {
                statusCode: 200,
                body: { success: true, orderId: doc.id, orderNumber: doc.data().orderNumber, alreadyExists: true },
            };
        }
    } catch (dupCheckError) {
        console.error("⚠️ Duplicate-order check failed, proceeding anyway:", dupCheckError.message);
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const orderRef = db.collection("orders").doc();

    const orderData = {
        orderNumber,
        razorpay_order_id,
        razorpay_payment_id,
        customer,
        items,
        amount,
        orderSource: items.length > 1 ? "cart" : "buy-now",
        paymentStatus: isCollaboration ? "collaboration" : (paymentMethod === "cod" ? "cod_advance_paid" : "paid"),
        orderStatus: "pending",
        createdAt: new Date().toISOString(),
        dispatchDate: dispatchDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        coupon: coupon || null,
        isCollaboration: isCollaboration || false,
        paymentMethod: paymentMethod || "online",
        codAdvanceAmount: paymentMethod === "cod" ? (codAdvanceAmount || 0) : null,
        codAmountDue: paymentMethod === "cod" ? (codAmountDue || 0) : null,
    };

    const finishUp = async (finalOrderId) => {
        if (customCouponId) {
            try {
                const customCouponRef = db.collection('customCoupons').doc(customCouponId);
                await customCouponRef.update({
                    isUsed: true,
                    usedAt: new Date().toISOString(),
                    usedBy: customer.email || customer.fullName,
                    orderId: razorpay_order_id
                });
            } catch (couponError) {
                console.error("❌ Error marking custom coupon as used:", couponError);
            }
        }

        // Notifications don't need to block the response - waitUntil keeps
        // them running after we return, so the caller (browser or webhook)
        // isn't stuck waiting on slow SMTP/WhatsApp calls.
        const emailPromise = sendConfirmationEmail({
            orderId: finalOrderId,
            orderNumber,
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        });

        // COD counts as a real, confirmed order: the customer has paid a
        // genuine advance and we are shipping it. Gating this on 'paid'
        // alone meant every COD customer got the email but no WhatsApp
        // confirmation, then messaged us asking why - which is exactly how
        // this was found.
        const CONFIRMABLE_STATUSES = ['paid', 'cod_advance_paid'];
        if (CONFIRMABLE_STATUSES.includes(orderData.paymentStatus)) {
            const whatsappPromise = sendConfirmationWhatsApp({ customer, orderNumber, amount });
            waitUntil(Promise.allSettled([emailPromise, whatsappPromise]));
        } else {
            waitUntil(emailPromise);
        }
    };

    let stockUpdated = [];
    let stockConflict = null;
    try {
        console.log("📦 Processing items for stock consumption:", JSON.stringify(items, null, 2));
        const applied = await applyOrderStockConsumption(db, items, {
            orderId: orderRef.id,
            orderNumber,
            customerName: customer.fullName,
            customerPhone: customer.mobileNumber,
        });
        stockUpdated = applied.map((entry) => ({
            productId: entry.kind === "product" ? entry.productRef.id : entry.dhotiId,
            collection: entry.kind === "product" ? entry.productRef.parent.id : "dhotis",
            size: entry.size,
            quantityConsumed: entry.delta,
        }));
    } catch (stockError) {
        // Whatever the reason, Razorpay has already captured this customer's
        // payment by the time this function runs (that's what triggers it,
        // via either the client path or the webhook) - refusing to save the
        // order here would lose a paid order with no record anywhere except
        // server logs. Save it regardless and flag it instead of pretending
        // the sale didn't happen.
        //
        // applyOrderStockConsumption fully rolls back any partially-applied
        // items before rethrowing, whatever the failure reason - so in every
        // case here, net stock impact for this order is zero. stockConflict
        // records that (cancel-order relies on it to know there's nothing to
        // restore).
        stockConflict = stockError.message;
        console.error(`⚠️ Stock consumption failed while creating order - saving anyway, flagged for review: ${stockError.message}`);
    }

    if (stockConflict) {
        orderData.stockConflict = stockConflict;
    }

    try {
        await orderRef.set(orderData);
        console.log(`✅ Order ${orderNumber} created (${orderRef.id})`);
        await finishUp(orderRef.id);

        return {
            statusCode: 200,
            body: {
                success: true,
                orderId: orderRef.id,
                orderNumber,
                stockUpdated,
                stockConflict,
            },
        };
    } catch (saveError) {
        console.error("❌ Failed to save order to Firestore:", saveError);
        return { statusCode: 500, body: { success: false, message: "Server error while saving order", error: saveError.message } };
    }
}
