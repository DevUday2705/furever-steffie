import { initializeApp, cert, getApps } from "firebase-admin/app";
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

// Client-side fast path, called from the browser right after Razorpay
// payment succeeds. The Razorpay webhook (api/razorpay-webhook.js) calls the
// same shared createOrderFromPayment logic as a server-side safety net in
// case this call never fires (e.g. the customer's network drops right after
// paying) - both are idempotent on razorpay_order_id.
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const result = await createOrderFromPayment(req.body);
    return res.status(result.statusCode).json(result.body);
}
