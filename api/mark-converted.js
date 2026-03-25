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
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Missing required field: sessionId' });
        }

        // Update the abandoned checkout document to mark as converted
        const abandonedCheckoutRef = db.collection('abandoned_checkouts').doc(sessionId);
        
        // Check if document exists first
        const doc = await abandonedCheckoutRef.get();
        if (!doc.exists) {
            console.log(`⚠️ Abandoned checkout not found for sessionId: ${sessionId}`);
            return res.status(404).json({ error: 'Abandoned checkout not found' });
        }

        // Mark as converted
        await abandonedCheckoutRef.update({
            status: 'converted',
            emailStage: -1,  // Never send emails after conversion
            convertedAt: serverTimestamp()
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