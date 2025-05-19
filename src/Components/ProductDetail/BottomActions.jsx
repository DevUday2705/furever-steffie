// src/components/ProductDetail/BottomActions.jsx

import React from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const BottomActions = ({
  product,
  images,
  isBeaded,
  isFullSet,
  selectedSize,
  calculatePrice,
  navigate,
  addToCart,
  setIsOpen,
  measurements,
  selectedDhoti,
  measurementsValid,
  requiresMeasurements,
}) => {
  const handleBuyNow = () => {
    const orderDetails = {
      productId: product.id,
      name: product.name,
      subcategory: product.subcategory,
      isBeaded,
      isFullSet,
      selectedDhoti,
      selectedSize,
      price: calculatePrice(),
      image: images[0],
      measurements: requiresMeasurements ? measurements : null, // Include measurements
    };
    navigate("/checkout", { state: { orderDetails, sizeConfirmed: true } });
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      subcategory: product.subcategory,
      isBeaded,
      isFullSet,
      selectedSize,
      price: calculatePrice(),
      image: images[0],
      quantity: 1,
      measurements: requiresMeasurements ? measurements : null, // Include measurements
    });
    toast.success("Added To Cart");
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
      <motion.button
        disabled={requiresMeasurements ? !measurementsValid : !selectedSize}
        className={`w-full py-3 ${
          requiresMeasurements
            ? !measurementsValid
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-gray-800 text-white"
            : !selectedSize
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-gray-800 text-white"
        } font-medium rounded-md`}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyNow}
      >
        Buy Now • ₹{calculatePrice()}
      </motion.button>

      <motion.button
        disabled={requiresMeasurements ? !measurementsValid : !selectedSize}
        className={`w-full py-3 mt-2 font-medium rounded-md border ${
          requiresMeasurements
            ? !measurementsValid
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "text-gray-800 border-gray-800"
            : !selectedSize
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-gray-800 border-gray-800"
        }`}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
      >
        Add to Cart • ₹{calculatePrice()}
      </motion.button>
    </div>
  );
};

export default BottomActions;
