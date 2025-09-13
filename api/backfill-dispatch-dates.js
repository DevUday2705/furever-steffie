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
        console.log("🔄 Starting dispatch date backfill...");

        // Get all orders without dispatch date
        const ordersSnapshot = await db.collection("orders").get();
        const batch = db.batch();
        let updateCount = 0;

        ordersSnapshot.forEach((doc) => {
            const orderData = doc.data();

            // Only update orders that don't have a dispatch date
            if (!orderData.dispatchDate && orderData.createdAt) {
                // Calculate dispatch date as 3 days after order creation
                const orderDate = new Date(orderData.createdAt);
                const dispatchDate = new Date(orderDate);
                dispatchDate.setDate(orderDate.getDate() + 3);

                // Update the document
                batch.update(doc.ref, {
                    dispatchDate: dispatchDate.toISOString()
                });

                updateCount++;
                console.log(`📅 Updated order ${doc.id} - Order: ${orderDate.toLocaleDateString()}, Dispatch: ${dispatchDate.toLocaleDateString()}`);
            }
        });

        if (updateCount > 0) {
            await batch.commit();
            console.log(`✅ Successfully updated ${updateCount} orders with dispatch dates`);

            return res.status(200).json({
                success: true,
                message: `Updated ${updateCount} orders with dispatch dates`,
                updatedCount: updateCount
            });
        } else {
            console.log("ℹ️ No orders needed dispatch date updates");
            return res.status(200).json({
                success: true,
                message: "No orders needed dispatch date updates",
                updatedCount: 0
            });
        }

    } catch (error) {
        console.error("❌ Error updating dispatch dates:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating dispatch dates",
            error: error.message
        });
    }
}