import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
let db;

// Initialize Firestore only once
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
        credential: cert({
            ...serviceAccount,
            private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
    });

    db = getFirestore();
} else {
    db = getFirestore();
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !customer || !items || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check and update stock for XS, S, M sizes
        const batch = db.batch();
        const stockUpdates = [];

        for (const item of items) {
            if (['XS', 'S', 'M'].includes(item.selectedSize)) {
                const productRef = db.collection(`${item.subcategory}s`).doc(item.productId);
                const productDoc = await productRef.get();
                
                if (!productDoc.exists) {
                    return res.status(400).json({ 
                        message: `Product ${item.productId} not found` 
                    });
                }

                const product = productDoc.data();
                const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                const requestedQty = item.quantity || 1;

                if (currentStock < requestedQty) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}` 
                    });
                }

                // Prepare stock update
                stockUpdates.push({
                    ref: productRef,
                    size: item.selectedSize,
                    newStock: currentStock - requestedQty,
                    productId: item.productId
                });
            }
        }

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        const orderData = {
            orderNumber,
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items, // Should contain: productId, name, selectedSize, price, quantity, etc.
            amount,
            orderSource: items.length > 1 ? "cart" : "buy-now",
            paymentStatus: "paid",
            orderStatus: "pending",
            createdAt: new Date().toISOString(),
        };

        // Save order and update stock in a batch
        const orderRef = db.collection("orders").doc();
        batch.set(orderRef, orderData);

        // Add stock updates to batch
        for (const update of stockUpdates) {
            batch.update(update.ref, {
                [`sizeStock.${update.size}`]: update.newStock
            });
        }

        // Commit all changes atomically
        await batch.commit();

        return res.status(200).json({ 
            success: true, 
            orderId: orderRef.id, 
            orderNumber,
            stockUpdated: stockUpdates.map(u => ({
                productId: u.productId,
                size: u.size,
                newStock: u.newStock
            }))
        });
    } catch (error) {
        console.error("❌ Failed to save order to Firestore:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving order",
        });
    }
}
