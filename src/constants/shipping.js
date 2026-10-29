// Domestic shipping prices - shared by checkout and the product page's
// delivery check so both always quote the same thing.
// Standard domestic shipping is free from ₹1000 (after discounts); smaller
// orders pay a flat charge so clearance-priced items don't ship at a loss.
export const FREE_SHIPPING_THRESHOLD = 1000;
export const LOW_ORDER_SHIPPING_CHARGE = 70;
export const EXPRESS_SHIPPING_CHARGE = 299;
export const EXPRESS_DELIVERY_TEXT = "Get it within 3-4 days";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

// Shiprocket's state name -> our dropdown value ("Jammu & Kashmir" ->
// "Jammu and Kashmir", "NCT of Delhi" -> "Delhi"), or "" if no match.
export function matchIndianState(name) {
  const norm = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
  const n = norm(name || "");
  if (!n) return "";
  return INDIAN_STATES.find((s) => norm(s) === n) || INDIAN_STATES.find((s) => n.includes(norm(s))) || "";
}

// Pincode typed into the product page's delivery check - checkout pre-fills it.
export const SAVED_PINCODE_KEY = "fs_delivery_pincode";

export function loadSavedPincode() {
  try {
    return localStorage.getItem(SAVED_PINCODE_KEY) || "";
  } catch {
    return "";
  }
}

export function savePincode(pincode) {
  try {
    localStorage.setItem(SAVED_PINCODE_KEY, pincode);
  } catch {
    // private mode / storage blocked - pre-fill is just a convenience
  }
}
