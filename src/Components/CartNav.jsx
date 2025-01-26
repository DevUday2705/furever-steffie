import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";

const CartNav = () => {
  const { selections, updateSelections } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const handleUpdateQty = (item, actionType) => {
    updateSelections(
      "cart",
      actionType === "add"
        ? selections.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, qty: cartItem.qty + 1 }
              : cartItem
          )
        : selections.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, qty: Math.max(1, cartItem.qty - 1) }
              : cartItem
          )
    );
  };

  const handleRemoveFromCart = (itemId) => {
    updateSelections(
      "cart",
      selections.cart.filter((item) => item.id !== itemId)
    );
  };

  const calculateTotal = () => {
    return selections.cart
      .reduce((total, item) => total + parseFloat(item.price) * item.qty, 0)
      .toFixed(2);
  };
  const isFreeShipping = calculateTotal() > 1499;
  return (
    <div className="relative">
      <img
        onClick={() => setIsOpen(!isOpen)}
        src="/images/bag.png"
        className="h-8 cursor-pointer"
        alt="logo"
      />
      {selections.cart.length > 0 && (
        <div className="absolute -top-1 -right-1 bg-black text-white h-5 w-5 text-sm flex items-center justify-center rounded-full">
          {selections.cart.length}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl z-50 p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <img src="/images/close.png" className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Items */}
              {selections.cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Your cart is empty
                </div>
              ) : (
                <div className="space-y-4">
                  {selections?.cart?.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex items-center space-x-4 border-b pb-4"
                    >
                      <img
                        src={item?.img}
                        alt={item?.img}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item?.name}</h3>
                        <p className="text-gray-600">${item?.price}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleUpdateQty(item, "subtract")}
                            className="bg-gray-200 px-2 rounded"
                          >
                            -
                          </button>
                          <span>{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQty(item, "add")}
                            className="bg-gray-200 px-2 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:bg-red-50 rounded-full p-2"
                      >
                        <img src="/images/trash.png" className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              {selections.cart.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">
                      ₹{calculateTotal()}/-
                    </span>
                  </div>
                  {isFreeShipping && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="p-2 rounded-md bg-black text-white mb-5"
                    >
                      🎉 Hurrey! You unlocked free shipping!
                    </motion.div>
                  )}
                  <button className="w-full cursor-pointer bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors">
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartNav;
