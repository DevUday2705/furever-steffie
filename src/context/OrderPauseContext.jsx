import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getCatalog } from "../utils/catalog";

const OrderPauseContext = createContext();

export const useOrderPause = () => {
  const context = useContext(OrderPauseContext);
  if (!context) {
    throw new Error("useOrderPause must be used within OrderPauseProvider");
  }
  return context;
};

// Customers get the switch from the CDN-cached catalog (at most a minute
// old) instead of a live Firestore listener each - those listeners were a
// read per visitor. It's checked again whenever they come back to the tab.
// Staff on admin pages read it live so the toggle always shows the truth.
async function readOrderPause() {
  if (window.location.pathname.startsWith("/admin")) {
    const snap = await getDoc(doc(db, "settings", "orderPause"));
    return snap.exists() ? snap.data() : null;
  }
  return getCatalog("order-pause", { fresh: true });
}

export const OrderPauseProvider = ({ children }) => {
  const [ordersArePaused, setOrdersArePausedState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      readOrderPause()
        .then((data) => {
          // No document means orders are not paused
          if (!cancelled) setOrdersArePausedState(data?.ordersArePaused || false);
        })
        .catch((error) => {
          console.error("Error loading order pause status:", error);
          // On error, assume orders are not paused
          if (!cancelled) setOrdersArePausedState(false);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Function to update Firebase
  const setOrdersArePaused = async (pauseStatus) => {
    try {
      await setDoc(
        doc(db, "settings", "orderPause"),
        {
          ordersArePaused: pauseStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: "admin", // You can make this dynamic based on who's updating
        },
        { merge: true }
      );
      setOrdersArePausedState(pauseStatus);
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
