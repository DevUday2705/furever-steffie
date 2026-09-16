import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { resolveProductRef, adjustProductStock } from "../lib/stockLedger.js";
import { releaseReservation } from "../lib/reservations.js";

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

const DEFAULT_HOLD_HOURS = 24;

// Holds stock for a customer who's said "I'll place the order, just hold
// these for me" - decrements sizeStock exactly like a real sale (so it can't
// be sold to someone else) and logs it as a reservation, not an order.
async function handleReserve(req, res) {
    const { productId, category, subcategory, type, size, quantity, customerName, notes, holdHours } = req.body;

    if (!productId || !size || !quantity || quantity < 1) {
        return res.status(400).json({ message: "productId, size and a positive quantity are required" });
    }
    if (!customerName || !customerName.trim()) {
        return res.status(400).json({ message: "customerName is required so this reservation is traceable" });
    }

    try {
        const resolved = await resolveProductRef(db, { productId, category, subcategory, type });
        if (!resolved) {
            return res.status(404).json({ message: `Product ${productId} not found in any collection` });
        }

        const reservationRef = db.collection("reservations").doc();
        const now = new Date();
        const hours = Number(holdHours) > 0 ? Number(holdHours) : DEFAULT_HOLD_HOURS;
        const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

        const { previousStock, newStock } = await adjustProductStock(db, {
            productRef: resolved.ref,
            size,
            delta: -quantity,
            reason: "reservation",
            reservationId: reservationRef.id,
            customerName: customerName.trim(),
            note: notes || null,
            actor: "admin",
        });

        const productSnap = await resolved.ref.get();
        const productName = productSnap.data()?.name || productId;

        await reservationRef.set({
            productId,
            collectionName: resolved.collectionName,
            productName,
            size,
            quantity,
            customerName: customerName.trim(),
            notes: notes || "",
            status: "active",
            holdHours: hours,
            reservedAt: now.toISOString(),
            expiresAt,
            releasedAt: null,
            convertedAt: null,
            convertedOrderId: null,
        });

        return res.status(200).json({
            success: true,
            reservationId: reservationRef.id,
            previousStock,
            newStock,
            expiresAt,
        });
    } catch (error) {
        if (error.code === "INSUFFICIENT_STOCK") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("❌ stock reserve error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to create reservation", error: error.message });
    }
}

async function handleReleaseReservation(req, res) {
    const { reservationId } = req.body;
    if (!reservationId) return res.status(400).json({ message: "reservationId is required" });

    try {
        const result = await releaseReservation(db, reservationId, {
            reason: "reservation_released",
            terminalStatus: "released",
            actor: "admin",
        });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("❌ release-reservation error:", error.message);
        return res.status(error.status || 500).json({ success: false, message: error.message });
    }
}

// Customer actually bought it - the stock is already correctly decremented
// from the reservation, so this just closes the reservation out. No stock
// change: doing one here would double-count against the real order.
async function handleConvertReservation(req, res) {
    const { reservationId, orderId } = req.body;
    if (!reservationId) return res.status(400).json({ message: "reservationId is required" });

    try {
        const reservationRef = db.collection("reservations").doc(reservationId);
        const snap = await reservationRef.get();
        if (!snap.exists) return res.status(404).json({ message: "Reservation not found" });
        if (snap.data().status !== "active") {
            return res.status(409).json({ message: `Reservation is already ${snap.data().status}` });
        }

        await reservationRef.update({
            status: "converted",
            convertedAt: new Date().toISOString(),
            convertedOrderId: orderId || null,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ convert-reservation error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to convert reservation", error: error.message });
    }
}

// Restores every item's stock for an order being cancelled. Idempotent via
// order.stockRestored so toggling the status back and forth can't restock
// twice, and skips items whose stock was never actually consumed in the
// first place (e.g. an order saved via the read-timeout fallback path).
async function handleCancelOrder(req, res) {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    try {
        const orderRef = db.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) return res.status(404).json({ message: "Order not found" });

        const order = orderSnap.data();
        if (order.orderStatus === "cancelled") {
            return res.status(200).json({ success: true, alreadyCancelled: true });
        }
        if (order.stockRestored) {
            await orderRef.update({ orderStatus: "cancelled" });
            return res.status(200).json({ success: true, note: "Status set to cancelled; stock was already restored previously" });
        }
        if (order.stockConflict) {
            // Stock consumption failed and was fully rolled back when this
            // order was created (see stockConflict on lib/orderCreation.js) -
            // nothing was ever actually deducted, so there's nothing to give
            // back. Restoring "stock" here would create phantom stock that
            // was never really taken.
            await orderRef.update({ orderStatus: "cancelled", stockRestored: true, cancelledAt: new Date().toISOString() });
            return res.status(200).json({ success: true, note: "No stock to restore - this order's stock consumption had already failed and rolled back" });
        }

        const restored = [];
        const failures = [];

        for (const item of order.items || []) {
            const quantity = item.quantity || 1;
            try {
                const resolved = await resolveProductRef(db, {
                    productId: item.productId,
                    category: item.category,
                    subcategory: item.subcategory,
                    type: item.type,
                });
                if (!resolved) {
                    failures.push(`${item.name || item.productId}: product not found`);
                    continue;
                }
                await adjustProductStock(db, {
                    productRef: resolved.ref,
                    size: item.selectedSize,
                    delta: +quantity,
                    reason: "order_cancelled",
                    orderId,
                    orderNumber: order.orderNumber,
                    customerName: order.customer?.fullName,
                    customerPhone: order.customer?.mobileNumber,
                    actor: "admin",
                });
                restored.push({ productId: item.productId, size: item.selectedSize, quantity });
            } catch (itemError) {
                failures.push(`${item.name || item.productId}: ${itemError.message}`);
            }
        }

        await orderRef.update({
            orderStatus: "cancelled",
            stockRestored: true,
            cancelledAt: new Date().toISOString(),
        });

        return res.status(200).json({ success: true, restored, failures });
    } catch (error) {
        console.error("❌ cancel-order error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to cancel order", error: error.message });
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const { action } = req.body;

    if (action === "reserve") return handleReserve(req, res);
    if (action === "release-reservation") return handleReleaseReservation(req, res);
    if (action === "convert-reservation") return handleConvertReservation(req, res);
    if (action === "cancel-order") return handleCancelOrder(req, res);

    return res.status(400).json({
        message: "action must be 'reserve', 'release-reservation', 'convert-reservation', or 'cancel-order'",
    });
}
