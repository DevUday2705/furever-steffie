// One-off migration: extends every color in dhotis/inventory to cover the
// full kurta size range (XS,S,M,L,XL,2XL,4XL,6XL,8XL) instead of just
// XS/S/M/L. Only ADDS missing size keys, defaulted to 0 stock - never
// touches an existing size's stock count.
//
// Why: getAvailableDhtoisForSize() only returns a dhoti for a size if that
// size key exists with stock > 0. Sizes above L had no key at all, so
// Complete Set / Royal Set were unavailable for every XL+ kurta regardless
// of real stock. This migration doesn't invent stock (everything new is 0) -
// an admin still needs to fill in real numbers on /admin/dhotis for XL+.
//
// Usage:
//   node scripts/migrate-dhoti-sizes.js --dry-run
//   node scripts/migrate-dhoti-sizes.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
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

const FULL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL", "8XL"];
const META_KEYS = ["lastUpdated", "updatedBy"];
const isDryRun = process.argv.includes("--dry-run");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log(`\n${isDryRun ? "DRY RUN" : "LIVE RUN"} - extending dhotis/inventory size coverage\n`);

  const ref = doc(db, "dhotis", "inventory");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log('No dhotis/inventory document found - nothing to migrate.');
    return;
  }

  const data = snap.data();
  const dhotiIds = Object.keys(data).filter((k) => !META_KEYS.includes(k));
  const updates = {};
  let addedCount = 0;

  dhotiIds.forEach((id) => {
    const currentSizes = data[id]?.inventory || {};
    console.log(`${data[id].name} (${id}):`);
    FULL_SIZES.forEach((size) => {
      const has = Object.prototype.hasOwnProperty.call(currentSizes, size);
      if (has) {
        console.log(`  ${size}: ${currentSizes[size]}  (unchanged)`);
      } else {
        console.log(`  ${size}: (missing) -> 0`);
        updates[`${id}.inventory.${size}`] = 0;
        addedCount += 1;
      }
    });
  });

  if (addedCount === 0) {
    console.log("\nAll dhotis already cover the full size range - nothing to do.");
    return;
  }

  if (isDryRun) {
    console.log(`\nDry run only - would add ${addedCount} size key(s). Re-run without --dry-run to apply.`);
    return;
  }

  const backupDir = join(__dirname, "backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(
    backupDir,
    `dhotis-inventory-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`\nBackup written to ${backupPath}`);

  updates.lastUpdated = new Date().toISOString();
  updates.updatedBy = "size-range-migration";
  await updateDoc(ref, updates);

  console.log(`\nDone. Added ${addedCount} size key(s) across ${dhotiIds.length} dhoti color(s), all defaulted to 0.`);
  console.log("Fill in real stock for XL/2XL/4XL/6XL/8XL on /admin/dhotis.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
