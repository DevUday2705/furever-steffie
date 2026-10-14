import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Storefront reads of products and public settings. They come from
// /api/stock?catalog=..., which Vercel's CDN caches, so a page view costs no
// Firestore reads - reading Firestore directly from every visitor's browser
// is what ran the free daily quota dry when a reel went viral.
//
// Each name is fetched once per visit and shared by every page, so moving
// between the home page, listings and products costs nothing more either.
// Admin pages keep reading Firestore live; this is for customers only.

// Same names the API serves, for the fallback below.
const DOC_PATHS = {
  "dhoti-inventory": ["dhotis", "inventory"],
  settings: ["settings", "global"],
  "order-pause": ["settings", "orderPause"],
};

const loaded = new Map();

// Straight from Firestore - only when the API can't be reached (e.g. plain
// `vite` locally, which doesn't run the /api functions).
async function readFirestore(name) {
  const path = DOC_PATHS[name];
  if (path) {
    const snap = await getDoc(doc(db, path[0], path[1]));
    return snap.exists() ? snap.data() : null;
  }
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function fetchCatalog(name) {
  try {
    const res = await fetch(`/api/stock?catalog=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`answered ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`Catalog ${name}: API failed (${error.message}), reading Firestore directly`);
    return readFirestore(name);
  }
}

// `fresh` skips this visit's copy (the CDN may still answer from its own).
// Each caller gets its own array, so one page sorting it can't reorder
// another's.
export async function getCatalog(name, { fresh = false } = {}) {
  if (fresh || !loaded.has(name)) {
    const request = fetchCatalog(name);
    // A failure shouldn't stick for the rest of the visit.
    request.catch(() => {
      if (loaded.get(name) === request) loaded.delete(name);
    });
    loaded.set(name, request);
  }
  const data = await loaded.get(name);
  return Array.isArray(data) ? [...data] : data;
}

// A product added in the last few minutes may not be in the cached
// collection yet, and a link to it can be shared straight away.
export async function getLiveProduct(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
