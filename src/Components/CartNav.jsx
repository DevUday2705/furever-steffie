import React, { useContext, useState, useEffect, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { convertCurrency } from "../constants/currency";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { CurrencyContext } from "../context/currencyContext";
import { getTopProductsByGender } from "../constants/constant";
import { Sparkles, ArrowRight, Heart, Gift } from "lucide-react";
const CartNav = () => {
  const { cart, updateQuantity, removeFromCart, isOpen, setIsOpen, gender } =
    useAppContext();
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      const products = await getTopProductsByGender(gender);
      // Filter out products already in cart
      const cartProductIds = cart.map((item) => item.productId);
      const filtered = products
        .filter((product) => !cartProductIds.includes(product.id))
        .slice(0, 3); // Show max 3 recommendations
      setRecommendedProducts(filtered);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [gender, cart]);

  // Fetch recommendations when cart opens
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      fetchRecommendations();
    }
  }, [isOpen, cart.length, fetchRecommendations]);

  const calculateTotal = () =>
    cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);

  const isFreeShipping = calculateTotal() > 1499;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const { currency } = useContext(CurrencyContext);
  return (
    <div className="relative">
      <div className="relative">
        <img
          onClick={() => setIsOpen(!isOpen)}
          src="/images/bag.png"
          className="h-6 w-6 min-w-[1.5rem] min-h-[1.5rem] flex-shrink-0 cursor-pointer object-contain"
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
              className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
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
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <img
                        src="/images/bag.png"
                        className="w-10 h-10 opacity-50"
                        alt="Empty cart"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add some adorable outfits for your pet
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/");
                      }}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
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
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-grow">
                            <h3 className="font-semibold text-sm line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-xs">
                              Size: {item.selectedSize} •{" "}
                              {item.isBeaded ? "Hand Work" : "Simple"} •{" "}
                              {item.isFullSet ? "Full Set" : "Kurta"}
                            </p>
                            <p className="text-gray-900 font-medium text-sm mt-1">
                              {convertCurrency(item.price, currency)}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors"
                              >
                                -
                              </button>
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId, item)}
                            className="text-red-500 hover:bg-red-50 rounded-full p-2 transition-colors"
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

                    {/* Recommendations Section */}
                    {recommendedProducts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t pt-6 mb-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            You might also like
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {recommendedProducts.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}+${
                                product.category || product.type
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                              >
                                <img
                                  src={product.mainImage}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-grow">
                                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {convertCurrency(
                                      product.pricing?.basePrice || 0,
                                      currency
                                    )}
                                  </p>
                                  {product.pricing?.discountPercent > 0 && (
                                    <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mt-1">
                                      {product.pricing.discountPercent}% off
                                    </span>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Summary */}
                    <div className="border-t pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold">
                          {convertCurrency(calculateTotal(), currency)}
                        </span>
                      </div>

                      {/* Progress to free shipping */}
                      {!isFreeShipping && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              Add{" "}
                              {convertCurrency(
                                1500 - calculateTotal(),
                                currency
                              )}
                              for free shipping all over India
                            </span>
                            <span className="text-gray-600">
                              {Math.round((calculateTotal() / 1500) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  (calculateTotal() / 1500) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {isFreeShipping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium text-sm">
                              🎉 You&apos;ve unlocked free shipping!
                            </span>
                          </div>
                        </motion.div>
                      )}

                      <button
                        onClick={handleCheckout}
                        className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
                      >
                        Secure Checkout
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <p className="text-xs text-gray-500 text-center mt-3">
                        🔒 Secure payment • 30-day returns • Free size exchange
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartNav;
