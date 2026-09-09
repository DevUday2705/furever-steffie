import { FOREIGN_PRICE_MULTIPLIER } from "./geoPricing";

const currencyRates = {
    INR: 1,
    SGD: 0.0134016,
    MYR: 0.0428069,
    USD: 0.0104773,
    GBP: 0.00774269,
    NZD: 0.0177833,
    CAD: 0.0145379,
    AED: 0.0384779,
};

const currencySymbols = {
    INR: "₹",
    SGD: "S$",
    MYR: "RM",
    USD: "$",
    GBP: "£",
    NZD: "NZ$",
    CAD: "C$",
    AED: "د.إ",
};

// Any non-INR display applies the foreign price markup on top of the base
// INR price before converting - keeps every product listing/detail/cart view
// consistent with what gets actually charged at checkout for the same visitor.
export const convertCurrency = (value, targetCurrency = "INR", round = true) => {
    const rate = currencyRates[targetCurrency] || 1;
    const symbol = currencySymbols[targetCurrency] || "";

    const markedUpValue = targetCurrency === "INR" ? value : value * FOREIGN_PRICE_MULTIPLIER;
    const converted = markedUpValue * rate;
    const finalAmount = round ? Math.round(converted) : converted.toFixed(3);

    return `${symbol}${finalAmount}`;
};
