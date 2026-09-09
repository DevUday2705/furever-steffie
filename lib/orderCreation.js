import { getFirestore } from "firebase-admin/firestore";
import { waitUntil } from "@vercel/functions";
import { sendOrderConfirmationWhatsApp } from "./whatsappNotify.js";

// Shared order-creation logic, called from two places:
//  - api/save-order.js: the client-side fast path, called right after Razorpay
//    payment succeeds in the browser.
//  - api/razorpay-webhook.js: the server-to-server safety net, called by
//    Razorpay itself when payment.captured fires - this still creates the
//    order even if the customer's browser/network died right after paying.
// Both paths converge here so behavior never diverges, and this function is
// idempotent on razorpay_order_id so it's safe to be called by both for the
// same order (whichever gets there first wins; the other is a no-op).

function getDocWithTimeout(docRef, ms = 5000) {
    return Promise.race([
        docRef.get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore read timeout')), ms))
    ]);
}

async function updateDhotiInventory(db, dhotiType, size, quantityToReduce, batch) {
    const inventoryRef = db.collection('dhotis').doc('inventory');
    const inventorySnap = await getDocWithTimeout(inventoryRef, 5000);

    if (!inventorySnap.exists) {
        throw new Error('Dhoti inventory not found');
    }

    const currentInventory = inventorySnap.data();
    const currentStock = currentInventory[dhotiType]?.inventory[size] || 0;

    if (currentStock < quantityToReduce) {
        throw new Error(`Insufficient dhoti stock. Available: ${currentStock}, Requested: ${quantityToReduce} for ${dhotiType} size ${size}`);
    }

    const newStock = currentStock - quantityToReduce;

    batch.update(inventoryRef, {
        [`${dhotiType}.inventory.${size}`]: newStock,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'order-system'
    });

    console.log(`📦 Added dhoti inventory update to batch: ${dhotiType} size ${size} - ${currentStock} -> ${newStock}`);
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

    try {
        const batch = db.batch();
        const stockUpdates = [];
        console.log("📦 Processing items for stock check:", JSON.stringify(items, null, 2));

        const itemsToCheck = items.filter(i => ['XS', 'S', 'M'].includes(i.selectedSize));
        const readTimeoutMs = 8000;
        let readTimeoutOccurred = false;

        const readPromises = itemsToCheck.map(item => {
            let collectionName = item.category || item.subcategory || item.type;
            const collectionMap = {
                'kurta': 'kurtas',
                'pathani': 'pathanis',
                'lehenga': 'lehengas',
                'frock': 'frocks',
                'bandana': 'bandanas',
                'bowtie': 'bowties',
                'dhotis': 'dhotiss'
            };
            if (collectionMap[collectionName]) {
                collectionName = collectionMap[collectionName];
            } else if (collectionName && !collectionName.endsWith('s')) {
                collectionName += 's';
            }

            const productRef = db.collection(collectionName).doc(item.productId);
            return getDocWithTimeout(productRef, readTimeoutMs)
                .then(doc => ({ item, doc, productRef, collectionName }))
                .catch(err => ({ item, error: err, productRef, collectionName }));
        });

        const readResults = await Promise.all(readPromises);

        for (const result of readResults) {
            const item = result.item;
            if (result.error) {
                console.error(`❌ Read error for product ${item.productId}:`, result.error.message);
                if (result.error.message && result.error.message.toLowerCase().includes('timeout')) {
                    readTimeoutOccurred = true;
                    break;
                }
                return { statusCode: 500, body: { success: false, message: `Error reading product ${item.productId}`, error: result.error.message } };
            }

            const productDoc = result.doc;
            const productRef = result.productRef;
            const collectionName = result.collectionName;

            if (!productDoc || !productDoc.exists) {
                console.error(`❌ Product not found in primary collection: ${item.productId} (${collectionName})`);
                const alternativeCollections = ['kurtas', 'pathanis', 'lehengas', 'frocks', 'bandanas', 'bowties', 'dhotiss'];
                let found = false;
                for (const altCollection of alternativeCollections) {
                    try {
                        const altRef = db.collection(altCollection).doc(item.productId);
                        const altDoc = await getDocWithTimeout(altRef, readTimeoutMs);
                        if (altDoc && altDoc.exists) {
                            const product = altDoc.data();
                            const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                            const requestedQty = item.quantity || 1;
                            if (currentStock < requestedQty) {
                                return { statusCode: 400, body: { message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}` } };
                            }
                            stockUpdates.push({ ref: altRef, size: item.selectedSize, newStock: currentStock - requestedQty, productId: item.productId, collectionName: altCollection });
                            found = true;
                            break;
                        }
                    } catch (err) {
                        console.log(`Failed to read ${item.productId} from ${altCollection}:`, err.message);
                        if (err.message && err.message.toLowerCase().includes('timeout')) {
                            readTimeoutOccurred = true;
                            break;
                        }
                    }
                }
                if (readTimeoutOccurred) break;
                if (!found) {
                    return { statusCode: 400, body: { message: `Product ${item.productId} not found in any collection` } };
                }
            } else {
                const product = productDoc.data();
                const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                const requestedQty = item.quantity || 1;
                if (currentStock < requestedQty) {
                    return { statusCode: 400, body: { message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}` } };
                }
                stockUpdates.push({ ref: productRef, size: item.selectedSize, newStock: currentStock - requestedQty, productId: item.productId, collectionName });
            }
        }

        if (readTimeoutOccurred) {
            console.warn('⚠️ One or more Firestore reads timed out; will save order without stock updates after creating order');
        }

        console.log("🍀 Processing dhoti inventory updates...");
        for (const item of items) {
            if ((item.isFullSet || item.isRoyalSet) && item.selectedDhoti) {
                const dhotiQuantity = item.quantity || 1;
                console.log(`🍀 Item requires dhoti: ${item.name}, Dhoti: ${item.selectedDhoti}, Size: ${item.selectedSize}, Qty: ${dhotiQuantity}`);
                try {
                    await updateDhotiInventory(db, item.selectedDhoti, item.selectedSize, dhotiQuantity, batch);
                } catch (error) {
                    console.error(`❌ Dhoti inventory error for ${item.selectedDhoti} size ${item.selectedSize}:`, error.message);
                    return { statusCode: 400, body: { message: `Dhoti inventory error: ${error.message}` } };
                }
            }
        }

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

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

        console.log(`🔄 Creating order with number: ${orderNumber}`);

        const orderRef = db.collection("orders").doc();
        batch.set(orderRef, orderData);

        for (const update of stockUpdates) {
            batch.update(update.ref, {
                [`sizeStock.${update.size}`]: update.newStock
            });
        }

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

        if (readTimeoutOccurred) {
            console.warn('⚠️ Read timeout detected earlier — saving order without stock updates');
            try {
                const fallbackOrderRef = await db.collection('orders').add(orderData);
                await finishUp(fallbackOrderRef.id);
                return {
                    statusCode: 200,
                    body: { success: true, orderId: fallbackOrderRef.id, orderNumber, warning: 'Order saved but stock may not be updated due to Firestore read timeout', stockUpdated: [] },
                };
            } catch (fallbackSaveError) {
                console.error('❌ Failed to save fallback order after read timeout:', fallbackSaveError);
                return { statusCode: 500, body: { success: false, message: 'Failed to save order after Firestore read timeout', error: fallbackSaveError.message } };
            }
        }

        try {
            await batch.commit();
            console.log(`✅ Batch committed successfully!`);
            await finishUp(orderRef.id);

            return {
                statusCode: 200,
                body: {
                    success: true,
                    orderId: orderRef.id,
                    orderNumber,
                    stockUpdated: stockUpdates.map(u => ({
                        productId: u.productId,
                        size: u.size,
                        newStock: u.newStock,
                        collection: u.collectionName
                    })),
                },
            };
        } catch (batchError) {
            console.error("❌ Batch commit failed:", batchError);
            try {
                const fallbackOrderRef = await db.collection("orders").add(orderData);
                await finishUp(fallbackOrderRef.id);
                return {
                    statusCode: 200,
                    body: { success: true, orderId: fallbackOrderRef.id, orderNumber, warning: "Order saved but stock may not be updated", stockUpdated: [] },
                };
            } catch (fallbackError) {
                console.error("❌ Fallback order save also failed:", fallbackError);
                throw fallbackError;
            }
        }
    } catch (error) {
        console.error("❌ Failed to save order to Firestore:", error);
        return { statusCode: 500, body: { success: false, message: "Server error while saving order", error: error.message } };
    }
}
