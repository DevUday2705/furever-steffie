import React, { createContext, useState, useContext, useEffect } from "react";

// Create Context
export const AppContext = createContext();

// Custom Hook (optional but handy)
export const useAppContext = () => useContext(AppContext);

// Provider Component
export const AppProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('furever_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [gender, setGender] = useState("male");
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);
  const [selections, setSelections] = useState({
    gender: "",
    style: "",
    pet: "",
    customerData: {},
    variant: null,
    price: "",
    size: "",
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('furever_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const updateSelections = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  // Notification permission functions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setShowNotificationPermission(false);
      
      if (permission === 'granted') {
        localStorage.setItem('notificationPermissionAsked', 'true');
        return true;
      }
    }
    return false;
  };

  const checkAndShowNotificationRequest = () => {
    const hasAsked = localStorage.getItem('notificationPermissionAsked');
    if (!hasAsked && 'Notification' in window && Notification.permission === 'default') {
      setShowNotificationPermission(true);
    }
  };

  // n
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
        gender,
        setGender,
        currentStep,
        selections,
        updateSelections,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        isOpen,
        setIsOpen,
        showNotificationPermission,
        setShowNotificationPermission,
        requestNotificationPermission,
        checkAndShowNotificationRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
