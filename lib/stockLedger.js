// Single source of truth for every stock-affecting mutation: order
// consumption, order cancellation, manual reservations, reservation
// release/expiry. Every call here is one atomic Firestore transaction
// (read current stock, validate, write new stock) plus one row written to
// `stockLedger` in the SAME transaction - so the log can never drift from
// what actually happened to sizeStock, and two concurrent calls for the same
// product+size can't both succeed past the point where stock runs out
// (closes the oversell race the old read-then-batch-write approach had).

const PRODUCT_COLLECTION_MAP = {
    kurta: "kurtas",
    pathani: "pathanis",
    lehenga: "lehengas",
    frock: "frocks",
    bandana: "bandanas",
    bowtie: "bowties",
    tut: "tuts",
    tuxedo: "tuxedos",
};

const ALL_PRODUCT_COLLECTIONS = [
    "kurtas",
    "pathanis",
    "lehengas",
    "frocks",
    "bandanas",
    "bowties",
    "tuts",
    "tuxedos",
];

function normalizeCollectionName(raw) {
    if (!raw) return raw;
    if (PRODUCT_COLLECTION_MAP[raw]) return PRODUCT_COLLECTION_MAP[raw];
    return raw.endsWith("s") ? raw : `${raw}s`;
}

// Finds which collection a product actually lives in - category/type/subcategory
// naming has never been fully consistent in this catalog, so a best-guess
// collection is tried first and every other known product collection is
// checked as a fallback, exactly like order creation already did.
export async function resolveProductRef(db, { productId, category, subcategory, type }) {
    const guess = normalizeCollectionName(category || subcategory || type);
    const candidates = [guess, ...ALL_PRODUCT_COLLECTIONS].filter(
        (c, i, arr) => c && arr.indexOf(c) === i
    );

    for (const collectionName of candidates) {
        const ref = db.collection(collectionName).doc(productId);
        const snap = await ref.get();
        if (snap.exists) return { ref, snap, collectionName };
    }
    return null;
}

async function writeLedgerEntry(tx, db, entry) {
    const ledgerRef = db.collection("stockLedger").doc();
    tx.set(ledgerRef, {
        ...entry,
        createdAt: new Date().toISOString(),
    });
    return ledgerRef.id;
}

// delta: negative to consume stock (order, reservation), positive to give it
// back (cancellation, release, expiry). Throws if a negative delta would
// take stock below zero - callers should surface that as a 4xx to the client.
export async function adjustProductStock(db, {
    productRef,
    size,
    delta,
    reason,
    orderId = null,
    orderNumber = null,
    reservationId = null,
    customerName = null,
    customerPhone = null,
    note = null,
    actor = "system",
}) {
    if (!size) throw new Error("adjustProductStock requires a size");
    if (!delta) throw new Error("adjustProductStock requires a non-zero delta");

    return db.runTransaction(async (tx) => {
        const snap = await tx.get(productRef);
        if (!snap.exists) {
            throw new Error(`Product ${productRef.id} not found in ${productRef.parent.id}`);
        }
        const product = snap.data();
        const previousStock = product.sizeStock?.[size] || 0;
        const newStock = previousStock + delta;

        if (newStock < 0) {
            const err = new Error(
                `Insufficient stock for size ${size}. Available: ${previousStock}, Requested: ${-delta}`
            );
            err.code = "INSUFFICIENT_STOCK";
            throw err;
        }

        tx.update(productRef, { [`sizeStock.${size}`]: newStock });

        await writeLedgerEntry(tx, db, {
            kind: "product",
            productId: productRef.id,
            collectionName: productRef.parent.id,
            productName: product.name || null,
            size,
            change: delta,
            previousStock,
            newStock,
            reason,
            orderId,
            orderNumber,
            reservationId,
            customerName,
            customerPhone,
            note,
            actor,
        });

        return { previousStock, newStock };
    });
}

// Same contract as adjustProductStock but for the centralized dhoti
// inventory doc (dhotis/inventory), which stores every color's stock in one
// document rather than one product per doc.
export async function adjustDhotiStock(db, {
    dhotiId,
    size,
    delta,
    reason,
    orderId = null,
    orderNumber = null,
    reservationId = null,
    customerName = null,
    customerPhone = null,
    note = null,
    actor = "system",
}) {
    if (!size) throw new Error("adjustDhotiStock requires a size");
    if (!delta) throw new Error("adjustDhotiStock requires a non-zero delta");

    const inventoryRef = db.collection("dhotis").doc("inventory");

    return db.runTransaction(async (tx) => {
        const snap = await tx.get(inventoryRef);
        if (!snap.exists) throw new Error("Dhoti inventory not found");

        const inventory = snap.data();
        const dhotiData = inventory[dhotiId];
        if (!dhotiData) throw new Error(`Dhoti "${dhotiId}" not found in inventory`);

        const previousStock = dhotiData.inventory?.[size] || 0;
        const newStock = previousStock + delta;

        if (newStock < 0) {
            const err = new Error(
                `Insufficient dhoti stock for ${dhotiId} size ${size}. Available: ${previousStock}, Requested: ${-delta}`
            );
            err.code = "INSUFFICIENT_STOCK";
            throw err;
        }

        tx.update(inventoryRef, {
            [`${dhotiId}.inventory.${size}`]: newStock,
            lastUpdated: new Date().toISOString(),
            updatedBy: actor,
        });

        await writeLedgerEntry(tx, db, {
            kind: "dhoti",
            productId: dhotiId,
            collectionName: "dhotis",
            productName: dhotiData.name || dhotiId,
            size,
            change: delta,
            previousStock,
            newStock,
            reason,
            orderId,
            orderNumber,
            reservationId,
            customerName,
            customerPhone,
            note,
            actor,
        });

        return { previousStock, newStock };
    });
}
