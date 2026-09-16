import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Combines what used to be api/track-address.js and api/mark-converted.js
// into one file - Vercel Hobby caps a deployment at 12 serverless functions,
// and these two were small, always used together in the same checkout flow
// (track on address submit, mark-converted on payment success), so merging
// them costs nothing behaviorally and buys back a function slot.

let db;
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert({
            ...serviceAccount,
            private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
    });
}
db = getFirestore();

async function handleTrack(req, res) {
    try {
        const { sessionId, email, phone, name, cart, cartTotal, address, marketingOptIn } = req.body;

        if (!sessionId || !email) {
            return res.status(400).json({ error: 'Missing required fields: sessionId and email' });
        }
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: 'Cart must be a non-empty array' });
        }

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
            // Only true if the customer explicitly checked the WhatsApp
            // reminders box at checkout - the recovery job in whatsapp-agent
            // only ever reads carts where this is strictly `true`, so a
            // missing/false value here means "never message this cart."
            marketingOptIn: marketingOptIn === true,
            whatsappStage: 0,
            createdAt: new Date().toISOString(),
            lastNudgedAt: null,
            convertedAt: null
        };

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

async function handleMarkConverted(req, res) {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Missing required field: sessionId' });
        }

        const abandonedCheckoutRef = db.collection('abandoned_checkouts').doc(sessionId);

        const doc = await abandonedCheckoutRef.get();
        if (!doc.exists) {
            console.log(`⚠️ Abandoned checkout not found for sessionId: ${sessionId}`);
            return res.status(404).json({ error: 'Abandoned checkout not found' });
        }

        // Mark as converted. The recovery job only ever queries
        // status == 'abandoned', so flipping this alone is enough to stop
        // future nudges - it also double-checks against real orders on
        // every run, so a missed call here isn't a silent failure mode.
        await abandonedCheckoutRef.update({
            status: 'converted',
            convertedAt: new Date().toISOString()
        });

        console.log(`✅ Abandoned checkout marked as converted: ${sessionId}`);

        res.status(200).json({
            success: true,
            message: 'Abandoned checkout marked as converted',
            sessionId
        });
    } catch (error) {
        console.error('❌ Error marking abandoned checkout as converted:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action } = req.body;

    if (action === 'mark-converted') return handleMarkConverted(req, res);
    // Default to "track" so the existing track-address caller (which never
    // sent an action field) keeps working unchanged.
    return handleTrack(req, res);
}
