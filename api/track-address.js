import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, serverTimestamp } from "firebase-admin/firestore";

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sessionId, email, phone, name, cart, cartTotal, address } = req.body;

        if (!sessionId || !email) {
            return res.status(400).json({ error: 'Missing required fields: sessionId and email' });
        }

        // Ensure cart is an array and has items
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: 'Cart must be a non-empty array' });
        }

        // Create abandoned checkout document
        const abandonedCheckoutData = {
            email: email.toLowerCase().trim(),
            phone: phone || '',
            name: name || '',
            cart: cart.map(item => ({
                productId: item.id || item.productId || '',
                name: item.name || '',
                size: item.selectedSize || item.size || '',
                qty: item.quantity || 1,
                price: item.price || 0,
                image: item.image || '',
                subcategory: item.subcategory || '',
                category: item.category || ''
            })),
            cartTotal: cartTotal || 0,
            address: {
                line1: address?.addressLine1 || address?.line1 || '',
                line2: address?.addressLine2 || address?.line2 || '',
                city: address?.city || '',
                state: address?.state || '',
                pincode: address?.pincode || '',
                country: address?.country || 'india'
            },
            status: 'abandoned',
            emailStage: 0,
            createdAt: serverTimestamp(),
            lastEmailedAt: null,
            convertedAt: null
        };

        // Save to Firebase
        await db.collection('abandoned_checkouts').doc(sessionId).set(abandonedCheckoutData);

        console.log(`✅ Abandoned checkout tracked for session: ${sessionId}, email: ${email}`);

        res.status(200).json({ 
            success: true, 
            message: 'Abandoned checkout tracked successfully',
            sessionId 
        });

    } catch (error) {
        console.error('❌ Error tracking abandoned checkout:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}