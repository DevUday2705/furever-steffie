// One-off backfill: writes a stockLedger entry for every item in every order
// since BACKFILL_START, so the per-product Stock Log tab shows historical
// order activity too, not just activity from when the ledger feature shipped.
//
// Only ever WRITES to stockLedger (plus a one-time `stockLedgerBackfilled`
// marker on the order doc for idempotency) - never touches sizeStock, since
// current stock already reflects reality going forward and re-deriving a
// perfect historical before/after chain isn't possible (admin restocks
// before this feature existed were never recorded). previousStock/newStock
// are left null on these rows and clearly marked "historical record" in the
// UI, rather than inventing numbers we can't verify.
//
// Usage:
//   node scripts/backfill-stock-ledger.js --dry-run
//   node scripts/backfill-stock-ledger.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPx_dFNn4-99tCAeSY9ZyusKUP1lmtvUs",
  authDomain: "furever-steffie.firebaseapp.com",
  projectId: "furever-steffie",
  storageBucket: "furever-steffie.firebasestorage.app",
  messagingSenderId: "589323009936",
  appId: "1:589323009936:web:def7b87847e0049618bd15",
  measurementId: "G-TJT3Y79V9Z",
};

const BACKFILL_START = "2026-09-01T00:00:00.000Z";
const isDryRun = process.argv.includes("--dry-run");

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
const ALL_PRODUCT_COLLECTIONS = Object.values(PRODUCT_COLLECTION_MAP);

function normalizeCollectionName(raw) {
  if (!raw) return raw;
  if (PRODUCT_COLLECTION_MAP[raw]) return PRODUCT_COLLECTION_MAP[raw];
  return raw.endsWith("s") ? raw : `${raw}s`;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cache product name lookups (id -> name) per collection guess to avoid
// re-fetching the same product for every order that includes it.
const productNameCache = new Map();
async function findProductNameAndCollection(productId, guessCategory) {
  const cacheKey = productId;
  if (productNameCache.has(cacheKey)) return productNameCache.get(cacheKey);

  const guess = normalizeCollectionName(guessCategory);
  const candidates = [guess, ...ALL_PRODUCT_COLLECTIONS].filter((c, i, arr) => c && arr.indexOf(c) === i);

  for (const collectionName of candidates) {
    try {
      const snap = await getDocs(query(collection(db, collectionName)));
      const found = snap.docs.find((d) => d.id === productId);
      if (found) {
        const result = { collectionName, productName: found.data().name || productId };
        productNameCache.set(cacheKey, result);
        return result;
      }
    } catch {
      // try next candidate
    }
  }
  const fallback = { collectionName: guess || "unknown", productName: productId };
  productNameCache.set(cacheKey, fallback);
  return fallback;
}

async function main() {
  console.log(`\n${isDryRun ? "DRY RUN" : "LIVE RUN"} - backfilling stock ledger from ${BACKFILL_START}\n`);

  const snap = await getDocs(query(collection(db, "orders"), where("createdAt", ">=", BACKFILL_START)));
  console.log(`Found ${snap.size} order(s) since ${BACKFILL_START}\n`);

  let ordersProcessed = 0;
  let ordersSkipped = 0;
  let entriesWritten = 0;

  for (const orderDoc of snap.docs) {
    const order = orderDoc.data();

    if (order.stockLedgerBackfilled) {
      ordersSkipped += 1;
      continue;
    }

    const items = order.items || [];
    for (const item of items) {
      if (!item.productId || !item.selectedSize) continue;
      const quantity = item.quantity || 1;
      const { collectionName, productName } = await findProductNameAndCollection(
        item.productId,
        item.category || item.subcategory || item.type
      );

      console.log(
        `${order.orderNumber} (${order.createdAt}): ${productName} [${item.selectedSize}] x${quantity} - ${order.customer?.fullName || "?"} (${order.customer?.mobileNumber || "?"})`
      );

      if (!isDryRun) {
        await addDoc(collection(db, "stockLedger"), {
          kind: "product",
          productId: item.productId,
          collectionName,
          productName,
          size: item.selectedSize,
          change: -quantity,
          previousStock: null,
          newStock: null,
          reason: "order_backfill",
          orderId: orderDoc.id,
          orderNumber: order.orderNumber || null,
          reservationId: null,
          customerName: order.customer?.fullName || null,
          customerPhone: order.customer?.mobileNumber || null,
          note: "Backfilled from historical order data",
          actor: "system",
          createdAt: order.createdAt,
        });
        entriesWritten += 1;
      }
    }

    if (!isDryRun) {
      await updateDoc(doc(db, "orders", orderDoc.id), { stockLedgerBackfilled: true });
    }
    ordersProcessed += 1;
  }

  console.log(`\nOrders processed: ${ordersProcessed}, already-backfilled (skipped): ${ordersSkipped}`);
  if (isDryRun) {
    console.log("Dry run only - no writes performed. Re-run without --dry-run to apply.");
  } else {
    console.log(`Wrote ${entriesWritten} stockLedger entries.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
