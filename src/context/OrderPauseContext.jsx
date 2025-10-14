import React, { createContext, useContext, useState } from "react";

const OrderPauseContext = createContext();

export const useOrderPause = () => {
  const context = useContext(OrderPauseContext);
  if (!context) {
    throw new Error("useOrderPause must be used within OrderPauseProvider");
  }
  return context;
};

export const OrderPauseProvider = ({ children }) => {
  // Set to true to pause orders globally
  const [ordersArePaused, setOrdersArePaused] = useState(true);

  const value = {
    ordersArePaused,
    setOrdersArePaused,
  };

  return (
    <OrderPauseContext.Provider value={value}>
      {children}
    </OrderPauseContext.Provider>
  );
};

export default OrderPauseContext;
