import React, { createContext, useState, useContext } from "react";

// Create Context
export const AppContext = createContext();

// Custom Hook (optional but handy)
export const useAppContext = () => useContext(AppContext);

// Provider Component
export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    gender: "",
    style: "",
    pet: "",
    customerData: {},
    variant: null,
    price: "",
    size: "",
  });

  const updateSelections = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  // ADD TO CART
  const addToCart = (item) => {
    const existingIndex = cart.findIndex(
      (p) =>
        p.productId === item.productId &&
        p.isBeaded === item.isBeaded &&
        p.isFullSet === item.isFullSet &&
        p.selectedSize === item.selectedSize
    );

    if (existingIndex !== -1) {
      // If item already exists (same config), just increase quantity
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += item.quantity || 1;
      setCart(updatedCart);
    } else {
      setCart((prev) => [...prev, { ...item, quantity: item.quantity || 1 }]);
    }
  };

  // REMOVE FROM CART
  const removeFromCart = (productId, config = {}) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.isBeaded === config.isBeaded &&
            item.isFullSet === config.isFullSet &&
            item.selectedSize === config.selectedSize
          )
      )
    );
  };

  // UPDATE QUANTITY
  const updateQuantity = (productId, config = {}, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId &&
        item.isBeaded === config.isBeaded &&
        item.isFullSet === config.isFullSet &&
        item.selectedSize === config.selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentStep,
        selections,
        updateSelections,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
