import React, { createContext, useState, useContext, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

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
  const trackNotificationPermission = async (granted, userAgent = null) => {
    try {
      const analyticsData = {
        permissionGranted: granted,
        timestamp: serverTimestamp(),
        userAgent: userAgent || navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        sessionId: Date.now().toString(), // Simple session tracking
      };

      await addDoc(collection(db, 'notificationAnalytics'), analyticsData);
      
      console.log(`📊 Notification permission ${granted ? 'GRANTED' : 'DENIED'} - logged to Firebase`);
    } catch (error) {
      console.error('Error tracking notification permission:', error);
      // Fallback to localStorage if Firebase fails
      try {
        const fallbackStats = JSON.parse(localStorage.getItem('notificationStats') || '{ "enabled": 0, "disabled": 0 }');
        if (granted) fallbackStats.enabled += 1;
        else fallbackStats.disabled += 1;
        localStorage.setItem('notificationStats', JSON.stringify(fallbackStats));
      } catch (e) {
        console.error('Fallback tracking also failed:', e);
      }
    }
  };

  // Optional: Get basic stats from localStorage for immediate display (Firebase queries would need more setup)
  const getNotificationStats = () => {
    try {
      const stats = JSON.parse(localStorage.getItem('notificationStats') || '{ "enabled": 0, "disabled": 0 }');
      const total = stats.enabled + stats.disabled;
      return {
        ...stats,
        total,
        acceptanceRate: total > 0 ? ((stats.enabled / total) * 100).toFixed(1) : '0',
        note: 'Full analytics available in Firebase Console -> notificationAnalytics collection'
      };
    } catch (error) {
      return { enabled: 0, disabled: 0, total: 0, acceptanceRate: '0', note: 'Analytics stored in Firebase' };
    }
  };

  const checkAndShowNotificationRequest = async () => {
    const hasAsked = localStorage.getItem('notificationPermissionAsked');
    if (!hasAsked && 'Notification' in window && Notification.permission === 'default') {
      // Directly request browser permission without custom dialog
      try {
        const permission = await Notification.requestPermission();
        localStorage.setItem('notificationPermissionAsked', 'true');
        
        // Track the permission decision in Firebase
        const granted = permission === 'granted';
        await trackNotificationPermission(granted);
        
        if (granted) {
          console.log('🔔 User enabled notifications! Perfect for cart reminders and special offers.');
        } else {
          console.log('🔕 User declined notifications. They can still shop normally.');
        }
        
        return granted;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        localStorage.setItem('notificationPermissionAsked', 'true');
        await trackNotificationPermission(false, `Error: ${error.message}`); // Track errors too
        return false;
      }
    }
    return Notification.permission === 'granted';
  };

  // n
  const addToCart = (item) => {
    const existingIndex = cart.findIndex(
      (p) =>
        p.productId === item.productId &&
        p.isBeaded === item.isBeaded &&
        p.isFullSet === item.isFullSet &&
        p.isRoyalSet === item.isRoyalSet &&
        p.isDupattaSet === item.isDupattaSet &&
        p.selectedSize === item.selectedSize &&
        p.selectedDhoti === item.selectedDhoti &&
        p.selectedColor === item.selectedColor
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
        checkAndShowNotificationRequest,
        getNotificationStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
