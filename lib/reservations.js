import { resolveProductRef, adjustProductStock } from "./stockLedger.js";

// Gives held stock back and closes out the reservation. Shared by the admin
// "Release" action (api/stock.js) and the cron job that auto-expires
// forgotten reservations (api/cron/expire-reservations.js) - same logic,
// only the reason/terminal-status/actor differ.
export async function releaseReservation(db, reservationId, { reason, terminalStatus, actor }) {
    const reservationRef = db.collection("reservations").doc(reservationId);
    const snap = await reservationRef.get();
    if (!snap.exists) {
        const err = new Error(`Reservation ${reservationId} not found`);
        err.status = 404;
        throw err;
    }
    const reservation = snap.data();
    if (reservation.status !== "active") {
        const err = new Error(`Reservation ${reservationId} is already ${reservation.status}`);
        err.status = 409;
        throw err;
    }

    const resolved = await resolveProductRef(db, {
        productId: reservation.productId,
        category: reservation.collectionName,
    });
    if (!resolved) {
        const err = new Error(`Product ${reservation.productId} not found - cannot restore stock automatically`);
        err.status = 404;
        throw err;
    }

    const { previousStock, newStock } = await adjustProductStock(db, {
        productRef: resolved.ref,
        size: reservation.size,
        delta: +reservation.quantity,
        reason,
        reservationId,
        customerName: reservation.customerName,
        actor,
    });

    const timestampField = terminalStatus === "expired" ? "expiredAt" : "releasedAt";
    await reservationRef.update({
        status: terminalStatus,
        [timestampField]: new Date().toISOString(),
    });

    return { previousStock, newStock };
}
