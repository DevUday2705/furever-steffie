// Applied to the base INR product price for any visitor detected/selected as
// outside India. Both the browsing display (via convertCurrency) and the
// actual checkout charge (via CheckoutPage's getOrderBreakdown) use this same
// constant, so what a foreign visitor sees while shopping matches what they
// actually pay - showing a higher price and then charging less would be a
// real bug, not just a cosmetic mismatch.
export const FOREIGN_PRICE_MULTIPLIER = 1.2;

// Vercel sets x-vercel-ip-country (ISO 3166-1 alpha-2) on every request at
// the edge - this maps it to this app's checkout country dropdown values.
// Anything not listed is still treated as foreign for pricing, but has no
// exact checkout-country match, so it defaults to "usa" there so the markup
// still applies; the customer can still correct their real shipping country
// manually on the checkout form.
export const ISO_TO_CHECKOUT_COUNTRY = {
  IN: "india",
  US: "usa",
  GB: "uk",
  CA: "canada",
  AU: "australia",
  NZ: "newzealand",
  SG: "singapore",
  MY: "malaysia",
  AE: "dubai",
};

// Same header -> this app's currency context values. Countries without a
// supported native currency (see src/constants/currency.js - AUD/EUR/JPY etc
// aren't in currencyRates yet) fall back to USD, which still keeps them out
// of INR (so the foreign markup still applies) and is broadly understood.
export const ISO_TO_CURRENCY = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "USD",
  NZ: "NZD",
  SG: "SGD",
  MY: "MYR",
  AE: "AED",
};

export function mapDetectedCountryToCheckout(isoCode) {
  if (!isoCode) return null;
  return ISO_TO_CHECKOUT_COUNTRY[isoCode] || "usa";
}

export function mapDetectedCountryToCurrency(isoCode) {
  if (!isoCode || isoCode === "IN") return "INR";
  return ISO_TO_CURRENCY[isoCode] || "USD";
}
