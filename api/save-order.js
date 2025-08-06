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

        const docRef = await db.collection("orders").add(orderData);

        return res.status(200).json({ success: true, orderId: docRef.id, orderNumber });
    } catch (error) {
        console.error("❌ Failed to save order to Firestore:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving order",
        });
    }
}
