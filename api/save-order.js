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
//
// Stock is now adjusted via one Firestore transaction per line item (was one
// shared batch) so concurrent orders for the same size can't both oversell -
// a multi-item cart can take longer than the default limit to clear all of
// them.
export const config = {
    maxDuration: 30,
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const result = await createOrderFromPayment(req.body);
    return res.status(result.statusCode).json(result.body);
}
