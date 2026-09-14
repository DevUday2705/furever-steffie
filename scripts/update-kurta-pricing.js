// One-off bulk pricing update for the "kurtas" collection.
//
// Sets, on every document in "kurtas":
//   pricing.dhotiStandalonePrice = 900
//   pricing.fullSetAdditional    = 700
//   pricing.tasselsAdditional    = 150
//   pricing.beadedAdditional     = 200
//
// Overwrites unconditionally (not just where missing/zero) - run --dry-run
// first if you want to see the before/after diff without writing anything.
// A timestamped backup of every doc's current `pricing` object is written to
// scripts/backups/ before any write, so this can be reversed manually if needed.
//
// Usage:
//   node scripts/update-kurta-pricing.js --dry-run
//   node scripts/update-kurta-pricing.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const firebaseConfig = {
  apiKey: "AIzaSyDPx_dFNn4-99tCAeSY9ZyusKUP1lmtvUs",
  authDomain: "furever-steffie.firebaseapp.com",
  projectId: "furever-steffie",
  storageBucket: "furever-steffie.firebasestorage.app",
  messagingSenderId: "589323009936",
  appId: "1:589323009936:web:def7b87847e0049618bd15",
  measurementId: "G-TJT3Y79V9Z",
};

const NEW_VALUES = {
  dhotiStandalonePrice: 900,
  fullSetAdditional: 700,
  tasselsAdditional: 150,
  beadedAdditional: 200,
};

const isDryRun = process.argv.includes("--dry-run");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log(`\n${isDryRun ? "DRY RUN" : "LIVE RUN"} - updating "kurtas" pricing\n`);

  const snapshot = await getDocs(collection(db, "kurtas"));
  console.log(`Found ${snapshot.size} kurta product(s)\n`);

  const backup = {};
  const rows = [];

  snapshot.forEach((d) => {
    const data = d.data();
    backup[d.id] = { name: data.name, pricing: data.pricing || {} };
    rows.push({
      id: d.id,
      name: data.name,
      before: {
        dhotiStandalonePrice: data.pricing?.dhotiStandalonePrice,
        fullSetAdditional: data.pricing?.fullSetAdditional,
        tasselsAdditional: data.pricing?.tasselsAdditional,
        beadedAdditional: data.pricing?.beadedAdditional,
      },
    });
  });

  // Print a before -> after table for every product.
  rows.forEach((r) => {
    console.log(`${r.name} (${r.id})`);
    Object.entries(NEW_VALUES).forEach(([field, newVal]) => {
      const oldVal = r.before[field];
      const changed = oldVal !== newVal;
      console.log(
        `  ${field}: ${oldVal ?? "(unset)"} -> ${newVal}${changed ? "" : "  (no change)"}`
      );
    });
  });

  if (isDryRun) {
    console.log("\nDry run only - no writes performed. Re-run without --dry-run to apply.");
    return;
  }

  // Backup current pricing before writing, so this is reversible.
  const backupDir = join(__dirname, "backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(
    backupDir,
    `kurtas-pricing-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\nBackup of current pricing written to ${backupPath}`);

  // Firestore batches cap at 500 writes - chunk defensively even though this
  // collection is well under that today.
  const docs = snapshot.docs;
  const CHUNK_SIZE = 450;
  let updated = 0;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    chunk.forEach((d) => {
      batch.update(doc(db, "kurtas", d.id), {
        "pricing.dhotiStandalonePrice": NEW_VALUES.dhotiStandalonePrice,
        "pricing.fullSetAdditional": NEW_VALUES.fullSetAdditional,
        "pricing.tasselsAdditional": NEW_VALUES.tasselsAdditional,
        "pricing.beadedAdditional": NEW_VALUES.beadedAdditional,
      });
    });
    await batch.commit();
    updated += chunk.length;
    console.log(`Committed batch: ${updated}/${docs.length}`);
  }

  console.log(`\nDone. Updated ${updated} kurta product(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
