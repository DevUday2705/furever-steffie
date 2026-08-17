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
export const convertCurrency = (value, targetCurrency = "INR", round = true) => {
    const rate = currencyRates[targetCurrency] || 1;
    const symbol = currencySymbols[targetCurrency] || "";

    const converted = value * rate;
    const finalAmount = round ? Math.round(converted) : converted.toFixed(3);

    return `${symbol}${finalAmount}`;
};
