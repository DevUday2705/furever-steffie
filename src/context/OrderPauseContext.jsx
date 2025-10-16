import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const OrderPauseContext = createContext();

export const useOrderPause = () => {
  const context = useContext(OrderPauseContext);
  if (!context) {
    throw new Error("useOrderPause must be used within OrderPauseProvider");
  }
  return context;
};

export const OrderPauseProvider = ({ children }) => {
  const [ordersArePaused, setOrdersArePausedState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase for real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "orderPause"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setOrdersArePausedState(data.ordersArePaused || false);
        } else {
          // If document doesn't exist, orders are not paused by default
          setOrdersArePausedState(false);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to order pause status:", error);
        // On error, assume orders are not paused
        setOrdersArePausedState(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Function to update Firebase
  const setOrdersArePaused = async (pauseStatus) => {
    try {
      await updateDoc(doc(db, "settings", "orderPause"), {
        ordersArePaused: pauseStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin", // You can make this dynamic based on who's updating
      });
      // State will be updated automatically via the listener
    } catch (error) {
      console.error("Error updating order pause status:", error);
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const value = {
    ordersArePaused,
    setOrdersArePaused,
    loading, // Expose loading state for components that need it
  };

  return (
    <OrderPauseContext.Provider value={value}>
      {children}
    </OrderPauseContext.Provider>
  );
};

export default OrderPauseContext;
