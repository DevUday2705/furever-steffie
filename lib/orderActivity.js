import crypto from "crypto";
import { getOrderOwner, getStaffName, isOrderTeamMember, normalizeEmail } from "./orderTeam.js";

const MAX_TEXT_LENGTH = 2000;

// Comments and owner changes share one timeline on the order document, so the
// order list can show them without extra Firestore reads. Each change runs in
// a transaction: both admins can act on the same order at the same moment.
async function updateOrderActivity(db, orderId, buildChange) {
    const orderRef = db.collection("orders").doc(orderId);

    return db.runTransaction(async (transaction) => {
        const snap = await transaction.get(orderRef);
        if (!snap.exists) return { status: 404, body: { message: "Order not found." } };

        const order = snap.data();
        const change = buildChange(order);
        if (change.error) return { status: change.status, body: { message: change.error } };

        const entry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...change.entry };
        const update = {
            ...change.fields,
            orderActivity: [...(order.orderActivity || []), entry],
        };
        transaction.update(orderRef, update);

        return { status: 200, body: { success: true, update } };
    });
}

export async function addOrderComment(db, { orderId, author, text }) {
    const comment = String(text || "").trim();
    if (!orderId) return { status: 400, body: { message: "orderId is required." } };
    if (!comment) return { status: 400, body: { message: "Write a comment first." } };
    if (comment.length > MAX_TEXT_LENGTH) {
        return { status: 400, body: { message: `Comments can be up to ${MAX_TEXT_LENGTH} characters.` } };
    }

    return updateOrderActivity(db, orderId, () => ({
        entry: { type: "comment", author, text: comment },
    }));
}

export async function transferOrder(db, { orderId, author, toEmail, text }) {
    const newOwner = normalizeEmail(toEmail);
    const note = String(text || "").trim();
    if (!orderId) return { status: 400, body: { message: "orderId is required." } };
    if (!isOrderTeamMember(newOwner)) {
        return { status: 400, body: { message: "Orders can only be transferred to Chetna or Uday." } };
    }
    if (note.length > MAX_TEXT_LENGTH) {
        return { status: 400, body: { message: `Comments can be up to ${MAX_TEXT_LENGTH} characters.` } };
    }

    return updateOrderActivity(db, orderId, (order) => {
        const currentOwner = getOrderOwner(order);
        if (currentOwner === newOwner) {
            return { status: 409, error: `This order is already with ${getStaffName(newOwner)}.` };
        }
        return {
            fields: {
                assignedTo: newOwner,
                assignedBy: author,
                assignedAt: new Date().toISOString(),
            },
            entry: { type: "transfer", author, from: currentOwner, to: newOwner, text: note },
        };
    });
}
