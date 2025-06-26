import React, { createContext, useState, useEffect } from "react";

export const CurrencyContext = createContext();

const currencyRates = {
  INR: 1, // Indian Rupee
  SGD: 0.016, // Singapore Dollar
  MYR: 0.056, // Malaysian Ringgit
  USD: 0.012, // US Dollar
  GBP: 0.0094, // British Pound
  NZD: 0.019, // New Zealand Dollar
  CAD: 0.016,
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [rate, setRate] = useState(currencyRates["INR"]);

  useEffect(() => {
    setRate(currencyRates[currency]);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
};
