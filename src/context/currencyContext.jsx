import React, { createContext, useState, useEffect } from "react";

export const CurrencyContext = createContext();

const currencyRates = {
  INR: 1, // Indian Rupee
  SGD: 0.016, // Singapore Dollar
  MYR: 0.056, // Malaysian Ringgit
  USD: 0.012, // US Dollar
  GBP: 0.0094, // British Pound
  NZD: 0.019, // New Zealand Dollar
  CAD: 0.016, // Canadian Dollar
  AED: 0.044, // UAE Dirham
};

export const CurrencyProvider = ({ children }) => {
  // Initialize currency from localStorage or default to "INR"
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem("selectedCurrency") || "INR";
    } catch (error) {
      return "INR";
    }
  });

  const [rate, setRate] = useState(currencyRates[currency]);

  // Update rate when currency changes
  useEffect(() => {
    setRate(currencyRates[currency]);
  }, [currency]);

  // Save currency to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("selectedCurrency", currency);
    } catch (error) {
      console.error("Failed to save currency to localStorage:", error);
    }
  }, [currency]);
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
};
