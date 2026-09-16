import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { releaseReservation } from "../../lib/reservations.js";

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

// Runs on a schedule (see vercel.json) to release any reservation admin
// forgot to act on - the whole point of a hold is that it doesn't need
// manual cleanup. Restores stock exactly like a manual release, just
// tagged as "reservation_expired" and actor "system" in the ledger.
export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const nowIso = new Date().toISOString();
        const snap = await db
            .collection("reservations")
            .where("status", "==", "active")
            .where("expiresAt", "<=", nowIso)
            .get();

        if (snap.empty) {
            return res.status(200).json({ success: true, expired: 0 });
        }

        const results = [];
        for (const doc of snap.docs) {
            try {
                await releaseReservation(db, doc.id, {
                    reason: "reservation_expired",
                    terminalStatus: "expired",
                    actor: "system",
                });
                results.push({ reservationId: doc.id, ok: true });
            } catch (error) {
                console.error(`❌ Failed to auto-expire reservation ${doc.id}:`, error.message);
                results.push({ reservationId: doc.id, ok: false, error: error.message });
            }
        }

        const expiredCount = results.filter((r) => r.ok).length;
        console.log(`⏰ Expired ${expiredCount}/${results.length} reservation(s)`);
        return res.status(200).json({ success: true, expired: expiredCount, results });
    } catch (error) {
        console.error("❌ expire-reservations cron error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}
