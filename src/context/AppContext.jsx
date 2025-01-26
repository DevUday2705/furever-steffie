import React, { createContext, useState, useContext } from "react";

// Create Context
export const AppContext = createContext();

// Provider Component
export const AppProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    gender: "",
    style: "",
    pet: "",
    id: "",
    size: "xs",
    cart: [],
    customerData: {},
  });

  // Function to update selections
  const updateSelections = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  // Function to go to the next step

  return (
    <AppContext.Provider value={{ currentStep, selections, updateSelections }}>
      {children}
    </AppContext.Provider>
  );
};
