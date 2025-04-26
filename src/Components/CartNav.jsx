import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CartNav = () => {
  const { cart, updateQuantity, removeFromCart, isOpen, setIsOpen } =
    useAppContext();

  const navigate = useNavigate();

  const calculateTotal = () =>
    cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);

  const isFreeShipping = calculateTotal() > 1499;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout"); // or change this to your checkout route
  };
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  return (
    <div className="relative">
      <div className="relative">
        <img
          onClick={() => setIsOpen(!isOpen)}
          src="/images/bag.png"
          className="h-6 cursor-pointer"
          alt="Cart"
        />
        {totalCartItems > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
            {totalCartItems}
          </div>
        )}
      </div>

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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <img
                    src="/images/close.png"
                    className="w-6 h-6"
                    alt="Close"
                  />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Your cart is empty
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${item.selectedSize}-${item.isBeaded}-${item.isFullSet}-${index}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex items-center space-x-4 border-b pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-gray-600 text-xs">
                          Size: {item.selectedSize} •{" "}
                          {item.isBeaded ? "Hand Work" : "Simple"} •{" "}
                          {item.isFullSet ? "Full Set" : "Kurta"}
                        </p>
                        <p className="text-gray-700 text-sm mt-1">
                          ₹{item.price}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="bg-gray-200 px-2 rounded"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item,
                                item.quantity + 1
                              )
                            }
                            className="bg-gray-200 px-2 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item)}
                        className="text-red-500 hover:bg-red-50 rounded-full p-2"
                      >
                        <img
                          src="/images/trash.png"
                          className="w-5 h-5"
                          alt="Remove"
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {cart.length > 0 && (
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
                      transition={{ duration: 0.5 }}
                      className="p-2 rounded-md bg-black text-white mb-5 text-center"
                    >
                      🎉 Hurrey! You unlocked free shipping!
                    </motion.div>
                  )}
                  <button
                    onClick={handleCheckout}
                    className="w-full cursor-pointer bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
                  >
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
