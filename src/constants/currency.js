
const currencyRates = {
    INR: 1,
    SGD: 0.016,
    MYR: 0.056,
    USD: 0.012,
    GBP: 0.0094,
    NZD: 0.019,
    CAD: 0.016,
};

const currencySymbols = {
    INR: "₹",
    SGD: "S$",
    MYR: "RM",
    USD: "$",
    GBP: "£",
    NZD: "NZ$",
    CAD: "C$",
};

export const convertCurrency = (value, targetCurrency = "INR", round = true) => {
    const rate = currencyRates[targetCurrency] || 1;
    const symbol = currencySymbols[targetCurrency] || "";

    const converted = value * rate;
    const finalAmount = round ? Math.round(converted) : converted.toFixed(3);

    return `${symbol}${finalAmount}`;
};