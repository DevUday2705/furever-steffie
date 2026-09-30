import { getFirestore } from "firebase-admin/firestore";
import { waitUntil } from "@vercel/functions";
import { sendOrderConfirmationWhatsApp } from "./whatsappNotify.js";
import {
    resolveProductRef,
    adjustProductStock,
    adjustDhotiStock,
    checkStockAvailability,
    isStandaloneDhotiItem,
} from "./stockLedger.js";

// Shared order-creation logic, called from two places:
//  - api/save-order.js: the client-side fast path, called right after Razorpay
//    payment succeeds in the browser (also used by the admin order utility
//    and collaboration orders).
//  - api/razorpay-webhook.js: the server-to-server safety net, called by
//    Razorpay itself when payment.captured fires - this still creates the
//    order even if the customer's browser/network died right after paying.
// Both paths converge here and usually arrive within a second of each other
// (and Razorpay retries its webhook if we're slow to answer), so exactly-once
// creation is enforced with an atomic claim on razorpay_order_id - see
// claimOrder below.

// A claim still "processing" after this long means the function that took
// it died mid-way (timeout/crash) - the next caller may take over.
const CLAIM_STALE_MS = 2 * 60 * 1000;

// orderClaims/{razorpay_order_id} is taken inside a transaction, so when the
// browser and webhook race only one of them gets "claimed" - the other sees
// "in_progress" or "done" and never creates a second order. (The old check
// was a plain query-then-write: both callers could pass it before either had
// written, which is how one payment produced two or three orders, two or
// three Telegram alerts, and stock taken twice.)
// The order id/number are fixed at claim time, so a takeover after a crash
// finishes the SAME order - and because each stock deduction is keyed on
// that order id (see idempotencyKey), nothing is deducted twice.
async function claimOrder(db, razorpay_order_id) {
    const claimRef = db.collection("orderClaims").doc(razorpay_order_id);

    return db.runTransaction(async (tx) => {
        const snap = await tx.get(claimRef);
        const now = new Date();

        if (snap.exists) {
            const claim = snap.data();
            if (claim.status === "done") {
                return { state: "done", ...claim };
            }
            const isStale =
                claim.status === "failed" ||
                now.getTime() - Date.parse(claim.claimedAt) > CLAIM_STALE_MS;
            if (!isStale) {
                return { state: "in_progress", ...claim };
            }
            tx.update(claimRef, {
                status: "processing",
                claimedAt: now.toISOString(),
                attempts: (claim.attempts || 1) + 1,
            });
            return { state: "claimed", ...claim };
        }

        const claim = {
            orderId: db.collection("orders").doc().id,
            orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
            status: "processing",
            claimedAt: now.toISOString(),
            attempts: 1,
        };
        tx.set(claimRef, claim);
        return { state: "claimed", ...claim };
    });
}

async function setClaimStatus(db, razorpay_order_id, status) {
    try {
        await db.collection("orderClaims").doc(razorpay_order_id).update({
            status,
            [`${status}At`]: new Date().toISOString(),
        });
    } catch (error) {
        console.error(`⚠️ Failed to mark order claim ${razorpay_order_id} as ${status}:`, error.message);
    }
}

// Deducts stock for every item independently. The payment has already been
// taken by the time this runs, so one bad line (out of stock, product
// deleted) must not undo the deductions for the rest of the cart - the old
// all-or-nothing rollback did exactly that, leaving every other item in the
// order un-deducted and the stock log full of "rolled back" noise.
// Returns exactly what was deducted (stored on the order so a cancellation
// can give back precisely that) and what couldn't be (shown to admin).
async function applyOrderStockConsumption(db, items, { orderId, orderNumber, customerName, customerPhone }) {
    const consumed = [];
    const issues = [];
    const context = { orderId, orderNumber, customerName, customerPhone, reason: "order" };

    for (const [index, item] of items.entries()) {
        const quantity = item.quantity || 1;
        const size = item.selectedSize;
        const label = `${item.name || item.productId} (${size || "no size"})`;

        // Standalone dhoti: stock comes out of Dhoti Management for the
        // chosen colour (see isStandaloneDhotiItem), not the product doc.
        if (isStandaloneDhotiItem(item)) {
            try {
                if (!item.selectedColor) throw new Error("no dhoti colour selected");
                const { previousStock, newStock } = await adjustDhotiStock(db, {
                    ...context,
                    dhotiId: item.selectedColor,
                    size,
                    delta: -quantity,
                    idempotencyKey: `order_${orderId}_${index}_dhoti`,
                });
                consumed.push({ kind: "dhoti", dhotiId: item.selectedColor, name: item.name || null, size, quantity });
                console.log(`🍀 Dhoti ${item.selectedColor} size ${size}: ${previousStock} -> ${newStock}`);
            } catch (error) {
                console.error(`❌ Stock not deducted for ${label}:`, error.message);
                issues.push({ item: label, message: error.message });
            }
            continue;
        }

        try {
            const resolved = await resolveProductRef(db, {
                productId: item.productId,
                category: item.category,
                subcategory: item.subcategory,
                type: item.type,
            });
            if (!resolved) {
                throw new Error(`product ${item.productId} not found in any collection`);
            }

            const { previousStock, newStock } = await adjustProductStock(db, {
                ...context,
                productRef: resolved.ref,
                size,
                delta: -quantity,
                idempotencyKey: `order_${orderId}_${index}_product`,
            });
            consumed.push({
                kind: "product",
                productId: resolved.ref.id,
                collectionName: resolved.collectionName,
                name: item.name || null,
                size,
                quantity,
            });
            console.log(`📦 ${resolved.collectionName}/${item.productId} size ${size}: ${previousStock} -> ${newStock}`);
        } catch (error) {
            console.error(`❌ Stock not deducted for ${label}:`, error.message);
            issues.push({ item: label, message: error.message });
        }

        if ((item.isFullSet || item.isRoyalSet) && item.selectedDhoti) {
            const dhotiLabel = `${item.selectedDhoti} dhoti for ${label}`;
            try {
                const { previousStock, newStock } = await adjustDhotiStock(db, {
                    ...context,
                    dhotiId: item.selectedDhoti,
                    size,
                    delta: -quantity,
                    idempotencyKey: `order_${orderId}_${index}_dhoti`,
                });
                consumed.push({
                    kind: "dhoti",
                    dhotiId: item.selectedDhoti,
                    name: item.selectedDhotiDetails?.name || item.selectedDhoti,
                    size,
                    quantity,
                });
                console.log(`🍀 Dhoti ${item.selectedDhoti} size ${size}: ${previousStock} -> ${newStock}`);
            } catch (error) {
                console.error(`❌ Stock not deducted for ${dhotiLabel}:`, error.message);
                issues.push({ item: dhotiLabel, message: error.message });
            }
        }
    }

    return { consumed, issues };
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
//         paymentMethod, codAdvanceAmount, codAmountDue, orderSource,
//         strictStock }
// strictStock: refuse to create the order at all if anything is out of
// stock. Only for orders where no money has been taken by us yet (admin
// order utility, collaboration orders) - a paid order is always saved.
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
        orderSource,
        strictStock,
    } = info;

    if (!razorpay_order_id || !razorpay_payment_id || !customer || !items || !amount) {
        return { statusCode: 400, body: { success: false, message: "Missing required fields" } };
    }

    if (strictStock || isCollaboration) {
        const problems = await checkStockAvailability(db, items);
        if (problems.length) {
            return {
                statusCode: 409,
                body: {
                    success: false,
                    message: `Not in stock - order not created. ${problems.map((p) => p.message).join("; ")}`,
                    problems,
                },
            };
        }
    }

    // Orders created before orderClaims existed have no claim doc - catch
    // those by looking the order up directly.
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
        console.error("⚠️ Legacy duplicate-order check failed:", dupCheckError.message);
    }

    const claim = await claimOrder(db, razorpay_order_id);
    if (claim.state === "done") {
        console.log(`ℹ️ Order for ${razorpay_order_id} already created (${claim.orderId}), skipping duplicate`);
        return {
            statusCode: 200,
            body: { success: true, orderId: claim.orderId, orderNumber: claim.orderNumber, alreadyExists: true },
        };
    }
    if (claim.state === "in_progress") {
        console.log(`ℹ️ Order for ${razorpay_order_id} is being created by another request (${claim.orderId})`);
        return {
            statusCode: 202,
            body: { success: true, orderId: claim.orderId, orderNumber: claim.orderNumber, inProgress: true },
        };
    }

    const { orderId, orderNumber } = claim;
    const orderRef = db.collection("orders").doc(orderId);

    // Taking over from a request that died after saving the order but
    // before marking the claim done - the order is already complete.
    if (claim.attempts > 1) {
        const existingOrder = await orderRef.get();
        if (existingOrder.exists) {
            await setClaimStatus(db, razorpay_order_id, "done");
            return {
                statusCode: 200,
                body: { success: true, orderId, orderNumber, alreadyExists: true },
            };
        }
    }

    const orderData = {
        orderNumber,
        razorpay_order_id,
        razorpay_payment_id,
        customer,
        items,
        amount,
        orderSource: orderSource || (items.length > 1 ? "cart" : "buy-now"),
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

    try {
        console.log("📦 Processing items for stock consumption:", JSON.stringify(items, null, 2));
        const { consumed, issues } = await applyOrderStockConsumption(db, items, {
            orderId,
            orderNumber,
            customerName: customer.fullName,
            customerPhone: customer.mobileNumber,
        });

        // stockConsumption is the exact record of what this order took, so
        // cancelling it gives back precisely that - no more, no less.
        orderData.stockConsumption = consumed;
        if (issues.length) {
            // The sale happened (payment is already captured), but these
            // lines couldn't be taken out of stock - flag for admin instead
            // of pretending the sale didn't happen.
            orderData.stockIssues = issues;
            orderData.stockConflict = issues.map((i) => `${i.item}: ${i.message}`).join("; ");
            console.error(`⚠️ Order ${orderNumber} saved with stock issues: ${orderData.stockConflict}`);
        }

        await orderRef.set(orderData);
        await setClaimStatus(db, razorpay_order_id, "done");
        console.log(`✅ Order ${orderNumber} created (${orderId})`);
        await finishUp(orderId);

        return {
            statusCode: 200,
            body: {
                success: true,
                orderId,
                orderNumber,
                stockUpdated: consumed,
                stockConflict: orderData.stockConflict || null,
            },
        };
    } catch (saveError) {
        // Leave the claim as "failed" (not deleted) so a retry takes over
        // this same order id and its already-applied stock deductions are
        // recognised rather than repeated.
        await setClaimStatus(db, razorpay_order_id, "failed");
        console.error("❌ Failed to save order to Firestore:", saveError);
        return { statusCode: 500, body: { success: false, message: "Server error while saving order", error: saveError.message } };
    }
}
