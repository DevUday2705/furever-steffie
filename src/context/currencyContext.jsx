import React, { createContext, useState, useEffect } from "react";
import { mapDetectedCountryToCurrency, mapDetectedCountryToCheckout } from "../constants/geoPricing";

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
  const [detectedCountry, setDetectedCountry] = useState(() => {
    try {
      return localStorage.getItem("detectedCheckoutCountry") || null;
    } catch (error) {
      return null;
    }
  });

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

  // One-time IP geolocation on first-ever visit only - if the visitor has
  // already picked a currency before (manually or from a prior detection),
  // never override it. This is what makes foreign visitors see the marked-up
  // price (via convertCurrency) without having to manually switch currency.
  useEffect(() => {
    let alreadyDecided;
    try {
      alreadyDecided = localStorage.getItem("selectedCurrency");
    } catch (error) {
      alreadyDecided = null;
    }
    if (alreadyDecided) return;

    fetch("/api/detect-location")
      .then((res) => res.json())
      .then(({ countryCode }) => {
        if (!countryCode) return;
        setCurrency(mapDetectedCountryToCurrency(countryCode));
        const checkoutCountry = mapDetectedCountryToCheckout(countryCode);
        setDetectedCountry(checkoutCountry);
        try {
          localStorage.setItem("detectedCheckoutCountry", checkoutCountry);
        } catch (error) {
          // ignore
        }
      })
      .catch((error) => {
        console.error("Geo-location detection failed:", error);
      });
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, detectedCountry }}>
      {children}
    </CurrencyContext.Provider>
  );
};
