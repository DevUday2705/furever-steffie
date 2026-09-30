import Razorpay from "razorpay";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { checkStockAvailability } from "../lib/stockLedger.js";

if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert({
            ...serviceAccount,
            private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
    });
}
const db = getFirestore();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const {
        amount, // what Razorpay actually charges now (full amount for online, just the advance for COD)
        items = [],
        // Everything below is stashed as a "pending order" so the Razorpay
        // webhook can create the real order even if the customer's browser
        // never calls /api/save-order (network drop, closed tab, etc).
        fullAmount,
        customer,
        coupon,
        dispatchDate,
        isCollaboration,
        customCouponId,
        paymentMethod,
        codAdvanceAmount,
        codAmountDue,
    } = req.body;

    // Validate amount
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: "Valid amount is required" });
    }

    // Refuse before the customer pays, not after: once Razorpay captures
    // the money the order has to be accepted even if the stock is gone.
    // Catches carts that went stale (someone else bought the last one,
    // product was removed) while sitting in the customer's browser.
    if (items.length) {
        try {
            const problems = await checkStockAvailability(db, items);
            if (problems.length) {
                return res.status(409).json({
                    message: `Sorry, some items are no longer available: ${problems.map((p) => p.message).join("; ")}`,
                    problems,
                });
            }
        } catch (stockCheckError) {
            // Don't block a sale because the check itself broke - the order
            // path still records any shortfall for admin.
            console.error("⚠️ Pre-payment stock check failed, continuing:", stockCheckError.message);
        }
    }

    // Create Razorpay instance
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Setup order options
    const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        notes: {
            itemsCount: items.length,
            from: "Furever Steffie",
        },
    };

    try {
        const order = await razorpay.orders.create(options);

        // Best-effort: stash pending order data for the webhook safety net.
        // Don't fail order creation if this write fails - the client-side
        // save-order path still works normally either way.
        if (customer && items.length) {
            try {
                await db.collection("pendingOrders").doc(order.id).set({
                    customer,
                    items,
                    amount: fullAmount ?? amount,
                    coupon: coupon || null,
                    dispatchDate: dispatchDate || null,
                    isCollaboration: isCollaboration || false,
                    customCouponId: customCouponId || null,
                    paymentMethod: paymentMethod || "online",
                    codAdvanceAmount: codAdvanceAmount || null,
                    codAmountDue: codAmountDue || null,
                    createdAt: new Date().toISOString(),
                });
            } catch (pendingError) {
                console.error("⚠️ Failed to stash pending order (webhook safety net won't work for this order):", pendingError.message);
            }
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
}
