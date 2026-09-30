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
    // The storefront builds collection names as type + "s", so standalone
    // dhoti products (type "dhotis") really do live in "dhotiss" - not to be
    // confused with dhotis/inventory, which holds the dhotis that come with
    // Complete/Royal sets.
    dhotis: "dhotiss",
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
    "male-bandanas",
    "female-bandanas",
    "dhotiss",
];

function normalizeCollectionName(raw) {
    if (!raw) return raw;
    if (PRODUCT_COLLECTION_MAP[raw]) return PRODUCT_COLLECTION_MAP[raw];
    return raw.endsWith("s") ? raw : `${raw}s`;
}

// A standalone dhoti product (sold on its own, stored in "dhotiss") is the
// same physical stock as the set dhotis in Dhoti Management - so its stock
// is always taken from dhotis/inventory for the chosen colour, never from
// the product's own sizeStock (item.selectedColor is the Dhoti Management
// id - gold/black/white).
export function isStandaloneDhotiItem(item) {
    return [item.category, item.type, item.subcategory].includes("dhotis");
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

// idempotencyKey (optional) becomes the ledger row's document id. If a row
// with that id already exists, the adjustment already happened - e.g. an
// order being retried after a timeout - so it's returned as-is instead of
// taking the stock a second time.
async function readExistingLedgerEntry(tx, db, idempotencyKey) {
    if (!idempotencyKey) return null;
    const snap = await tx.get(db.collection("stockLedger").doc(idempotencyKey));
    if (!snap.exists) return null;
    const { previousStock, newStock } = snap.data();
    return { previousStock, newStock, alreadyApplied: true };
}

async function writeLedgerEntry(tx, db, idempotencyKey, entry) {
    const ledgerCollection = db.collection("stockLedger");
    const ledgerRef = idempotencyKey ? ledgerCollection.doc(idempotencyKey) : ledgerCollection.doc();
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
    idempotencyKey = null,
}) {
    if (!size) throw new Error("adjustProductStock requires a size");
    if (!delta) throw new Error("adjustProductStock requires a non-zero delta");

    return db.runTransaction(async (tx) => {
        const existing = await readExistingLedgerEntry(tx, db, idempotencyKey);
        if (existing) return existing;

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

        await writeLedgerEntry(tx, db, idempotencyKey, {
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
    idempotencyKey = null,
}) {
    if (!size) throw new Error("adjustDhotiStock requires a size");
    if (!delta) throw new Error("adjustDhotiStock requires a non-zero delta");

    const inventoryRef = db.collection("dhotis").doc("inventory");

    return db.runTransaction(async (tx) => {
        const existing = await readExistingLedgerEntry(tx, db, idempotencyKey);
        if (existing) return existing;

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

        await writeLedgerEntry(tx, db, idempotencyKey, {
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

// Read-only availability check for a whole cart, used BEFORE any money is
// taken (checkout) or any order is written (admin order utility), so an
// out-of-stock order is refused up front instead of being accepted and
// flagged afterwards. Quantities are summed per product+size first, so two
// lines of the same kurta in the same size are checked together.
// Returns a list of problems - empty means everything is available.
export async function checkStockAvailability(db, items) {
    const productNeeds = new Map();
    const dhotiNeeds = new Map();
    const problems = [];

    for (const item of items || []) {
        const quantity = item.quantity || 1;
        const size = item.selectedSize;
        const label = `${item.name || item.productId || "Item"} (${size || "no size"})`;

        if (!item.productId) {
            problems.push({ type: "not_found", item: label, message: `${label}: no product id - can't check stock` });
            continue;
        }
        if (!size) {
            problems.push({ type: "no_size", item: label, message: `${label}: no size selected` });
            continue;
        }

        if (isStandaloneDhotiItem(item)) {
            if (!item.selectedColor) {
                problems.push({ type: "no_color", item: label, message: `${label}: no dhoti colour selected` });
                continue;
            }
            // Pooled with set dhotis of the same colour+size below - they
            // come out of the same Dhoti Management count.
            const dKey = `${item.selectedColor}|${size}`;
            const dNeed = dhotiNeeds.get(dKey) || { dhotiId: item.selectedColor, size, label, quantity: 0 };
            dNeed.quantity += quantity;
            dhotiNeeds.set(dKey, dNeed);
            continue;
        }

        const resolved = await resolveProductRef(db, {
            productId: item.productId,
            category: item.category,
            subcategory: item.subcategory,
            type: item.type,
        });
        if (!resolved) {
            problems.push({ type: "not_found", item: label, message: `${label} is no longer available` });
            continue;
        }

        const key = `${resolved.ref.path}|${size}`;
        const need = productNeeds.get(key) || { snap: resolved.snap, size, label, quantity: 0 };
        need.quantity += quantity;
        productNeeds.set(key, need);

        if ((item.isFullSet || item.isRoyalSet) && item.selectedDhoti) {
            const dKey = `${item.selectedDhoti}|${size}`;
            const dNeed = dhotiNeeds.get(dKey) || { dhotiId: item.selectedDhoti, size, label, quantity: 0 };
            dNeed.quantity += quantity;
            dhotiNeeds.set(dKey, dNeed);
        }
    }

    for (const need of productNeeds.values()) {
        const available = need.snap.data().sizeStock?.[need.size] || 0;
        if (available < need.quantity) {
            problems.push({
                type: "insufficient",
                item: need.label,
                message: `${need.label}: only ${available} left, ${need.quantity} requested`,
            });
        }
    }

    if (dhotiNeeds.size) {
        const inventorySnap = await db.collection("dhotis").doc("inventory").get();
        const inventory = inventorySnap.exists ? inventorySnap.data() : {};
        for (const need of dhotiNeeds.values()) {
            const available = inventory[need.dhotiId]?.inventory?.[need.size] || 0;
            if (available < need.quantity) {
                const dhotiName = inventory[need.dhotiId]?.name || need.dhotiId;
                problems.push({
                    type: "insufficient",
                    item: need.label,
                    message: `${need.label}: only ${available} of the ${dhotiName} dhoti left, ${need.quantity} requested`,
                });
            }
        }
    }

    return problems;
}
