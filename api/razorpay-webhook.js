import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createOrderFromPayment } from "../lib/orderCreation.js";

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

// Vercel parses req.body as JSON by default, but signature verification
// needs the exact raw bytes Razorpay signed - so we opt out of that and
// read+verify the raw body ourselves before parsing it.
export const config = {
    api: {
        bodyParser: false,
    },
};

function readRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

// Server-to-server safety net: Razorpay calls this the moment a payment is
// captured, independent of the customer's browser. This means an order still
// gets created even if the customer's network drops or they close the tab
// right after paying - a real gap in the client-only flow. Relies on
// api/create-order.js having stashed the cart/customer details in
// pendingOrders/{razorpay_order_id} before checkout opened, since Razorpay's
// webhook payload only carries payment/order IDs, not our order data.
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const rawBody = await readRawBody(req);

    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    if (!signature || signature !== expectedSignature) {
        console.error("❌ Razorpay webhook signature mismatch");
        return res.status(400).json({ message: "Invalid signature" });
    }

    let payload;
    try {
        payload = JSON.parse(rawBody.toString("utf8"));
    } catch (parseError) {
        console.error("❌ Failed to parse Razorpay webhook body:", parseError);
        return res.status(400).json({ message: "Invalid JSON" });
    }

    // Acknowledge everything else - we only act on payment.captured, but
    // returning 200 for other events stops Razorpay from retrying them.
    if (payload.event !== "payment.captured") {
        return res.status(200).json({ received: true, ignored: payload.event });
    }

    const payment = payload.payload?.payment?.entity;
    const razorpay_order_id = payment?.order_id;
    const razorpay_payment_id = payment?.id;

    if (!razorpay_order_id || !razorpay_payment_id) {
        console.error("❌ Razorpay webhook payment.captured missing order_id/payment_id:", payload);
        return res.status(400).json({ message: "Missing order_id or payment_id in payload" });
    }

    try {
        const pendingSnap = await db.collection("pendingOrders").doc(razorpay_order_id).get();

        if (!pendingSnap.exists) {
            // Either the client-side save-order already handled this order and
            // there's nothing pending left to look up, or this order was never
            // stashed (e.g. collaboration orders never hit create-order at all).
            // Either way there's nothing actionable here - acknowledge and move on.
            console.log(`ℹ️ No pending order found for ${razorpay_order_id} (likely already created via client path)`);
            return res.status(200).json({ received: true, note: "no pending order found" });
        }

        const pending = pendingSnap.data();

        const result = await createOrderFromPayment({
            razorpay_order_id,
            razorpay_payment_id,
            customer: pending.customer,
            items: pending.items,
            amount: pending.amount,
            coupon: pending.coupon,
            dispatchDate: pending.dispatchDate,
            isCollaboration: pending.isCollaboration,
            customCouponId: pending.customCouponId,
            paymentMethod: pending.paymentMethod,
            codAdvanceAmount: pending.codAdvanceAmount,
            codAmountDue: pending.codAmountDue,
        });

        // Clean up regardless of outcome - either the order now exists, or
        // something's wrong with this pending record and retrying won't help.
        await pendingSnap.ref.delete().catch((err) => console.error("⚠️ Failed to delete pendingOrders doc:", err.message));

        console.log(`✅ Webhook created/confirmed order for ${razorpay_order_id}:`, result.body);
        return res.status(200).json({ received: true, result: result.body });
    } catch (error) {
        console.error("❌ Razorpay webhook processing error:", error);
        // Return 500 so Razorpay retries this webhook later.
        return res.status(500).json({ message: "Webhook processing failed", error: error.message });
    }
}
