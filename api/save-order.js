import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { readFileSync } from 'fs';

let app;

if (!app) {
    const serviceAccount = JSON.parse(
        readFileSync(path.resolve('./firebase-admin-key.json'), 'utf-8')
    );

    app = initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        } = req.body;

        const order = {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
            status: 'paid',
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('orders').add(order);

        return res.status(200).json({ success: true, orderId: docRef.id });
    } catch (error) {
        console.error('❌ Failed to save order to Firestore:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
