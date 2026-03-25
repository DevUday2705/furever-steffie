import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { sendAbandonedEmail } from '../emails/abandoned.js';

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

// For testing: 2 minute intervals, otherwise 15 minute intervals
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Email rules - using 2 minute intervals for testing
const EMAIL_RULES = [
  { stage: 0, delayMs: 2 * MINUTE,      nextStage: 1 },  // 2 minutes for testing (1 hour normally)
  { stage: 1, delayMs: 4 * MINUTE,     nextStage: 2 },  // 4 minutes for testing (24 hours normally) 
  { stage: 2, delayMs: 6 * MINUTE,     nextStage: 3 },  // 6 minutes for testing (72 hours normally)
];

// Uncomment below for production timing:
// const EMAIL_RULES = [
//   { stage: 0, delayMs: 1 * HOUR,      nextStage: 1 },
//   { stage: 1, delayMs: 24 * HOUR,     nextStage: 2 },
//   { stage: 2, delayMs: 72 * HOUR,     nextStage: 3 },
// ];

export default async function handler(req, res) {
    // Secure the cron endpoint
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('🚀 Starting abandoned cart cron job...');

        // Get all abandoned checkouts from Firestore
        const abandonedCheckoutsRef = db.collection('abandoned_checkouts');
        const snapshot = await abandonedCheckoutsRef
            .where('status', '==', 'abandoned')
            .get();

        if (snapshot.empty) {
            console.log('📭 No abandoned checkouts found');
            return res.status(200).json({ processed: 0, message: 'No abandoned checkouts found' });
        }

        const now = Date.now();
        const emailTasks = [];

        console.log(`📊 Found ${snapshot.size} abandoned checkouts to process`);

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const sessionId = docSnap.id;

            // Skip if emailStage is 3 (done) or -1 (never email)
            if (data.emailStage >= 3 || data.emailStage === -1) {
                return;
            }

            // Find the appropriate email rule for current stage
            const rule = EMAIL_RULES.find(r => r.stage === data.emailStage);
            if (!rule) {
                console.log(`⚠️ No rule found for emailStage ${data.emailStage} (session: ${sessionId})`);
                return;
            }

            // Check if enough time has elapsed
            const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt;
            const elapsed = now - createdAt;

            if (elapsed >= rule.delayMs) {
                console.log(`⏰ Time elapsed for ${sessionId}: ${Math.round(elapsed/MINUTE)} minutes (needed: ${Math.round(rule.delayMs/MINUTE)})`);
                emailTasks.push({ sessionId, data, rule });
            } else {
                console.log(`⏳ Waiting for ${sessionId}: ${Math.round((rule.delayMs - elapsed)/MINUTE)} minutes remaining`);
            }
        });

        console.log(`✉️ Processing ${emailTasks.length} email tasks`);

        // Process emails with error handling
        const results = await Promise.allSettled(
            emailTasks.map(async ({ sessionId, data, rule }) => {
                try {
                    console.log(`📧 Sending abandoned cart email ${rule.nextStage} to ${data.email} (session: ${sessionId})`);
                    
                    // Send the abandoned cart email
                    const emailResult = await sendAbandonedEmail(data, rule.nextStage);
                    
                    if (emailResult.success) {
                        // Update Firestore document
                        await abandonedCheckoutsRef.doc(sessionId).update({
                            emailStage: rule.nextStage,
                            lastEmailedAt: new Date().toISOString()
                        });
                        
                        console.log(`✅ Email ${rule.nextStage} sent successfully to ${data.email} (session: ${sessionId})`);
                        return { sessionId, success: true, stage: rule.nextStage };
                    } else {
                        console.error(`❌ Failed to send email ${rule.nextStage} to ${data.email}:`, emailResult.error);
                        return { sessionId, success: false, error: emailResult.error };
                    }
                } catch (error) {
                    console.error(`❌ Error processing ${sessionId}:`, error);
                    return { sessionId, success: false, error: error.message };
                }
            })
        );

        // Count successes and failures
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

        console.log(`🎯 Cron job completed: ${successful} emails sent, ${failed} failed`);

        res.status(200).json({ 
            processed: emailTasks.length,
            successful,
            failed,
            message: `Processed ${emailTasks.length} abandoned carts`
        });

    } catch (error) {
        console.error('❌ Cron job error:', error);
        res.status(500).json({ 
            error: 'Cron job failed', 
            message: error.message 
        });
    }
}