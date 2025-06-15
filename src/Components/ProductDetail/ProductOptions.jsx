import React, { useState } from "react";

import { motion } from "framer-motion";
import ColorSelector from "../ColorSelector";

const ProductOptions = ({
  product,
  isBeaded,
  setIsBeaded,
  isFullSet,
  setIsFullSet,
  selectedDhoti,
  setSelectedDhoti,
  selectedColor, // NEW
  setSelectedColor,
}) => {
  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
  };
  const { isBeadedAvailable, isNonBeadedAvailable } = product;

  const renderStyleOptions = () => {
    if (isBeadedAvailable && isNonBeadedAvailable) {
      // both available, show toggle
      return (
        <div className="mt-1 flex space-x-2">
          <button
            onClick={() => setIsBeaded(false)}
            className={`py-1.5 px-3 rounded-md text-sm ${
              !isBeaded ? "border-gray-800" : "border-gray-200"
            } border bg-gray-50 text-gray-800`}
          >
            Minimalist
          </button>
          <button
            onClick={() => setIsBeaded(true)}
            className={`py-1.5 px-3 rounded-md text-sm ${
              isBeaded ? "border-gray-800" : "border-gray-200"
            } border bg-gray-50 text-gray-800`}
          >
          Beaded Luxe
          </button>
          
        </div>
      );
    } else if (isBeadedAvailable) {
      // only beaded available
      return (
        <div className="mt-1">
          <button
            disabled
            className="py-1.5 px-3 rounded-md text-sm border border-gray-800 bg-gray-100 text-gray-800 cursor-not-allowed"
          >
          Beaded Luxe
          </button>
        </div>
      );
    } else if (isNonBeadedAvailable) {
      // only non-beaded available
      return (
        <div className="mt-1">
          <button
            disabled
            className="py-1.5 px-3 rounded-md text-sm border border-gray-800 bg-gray-100 text-gray-800 cursor-not-allowed"
          >
            Minimalist
          </button>
        </div>
      );
    } else {
      // neither available (very rare case)
      return null;
    }
  };

  const renderDhotiOptions = () => {
    if (!isFullSet || product.type !== "kurta") return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <h3 className="text-xs font-medium text-gray-900 mb-3">Dhoti Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {product.dhotis.map((dhoti) => (
            <motion.div
              key={dhoti.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDhoti(dhoti.id)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedDhoti === dhoti.id
                  ? "border-gray-800"
                  : "border-transparent"
              }`}
            >
              <div className="relative pb-3/4 h-20">
                <img
                  src={dhoti.image}
                  alt={dhoti.name}
                  className="absolute h-full w-full object-contain"
                />
              </div>
              <div className="p-1 bg-gray-50">
                <p className="text-xs font-medium text-center text-gray-800 truncate">
                  {dhoti.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="px-4 pb-4 space-y-4">
      <ColorSelector
        colors={product.colors}
        selectedColor={selectedColor}
        onColorSelect={handleColorChange}
      />

      {/* STYLE OPTIONS */}
      {["kurta", "lehnga", "tuxedo"].includes(product.type) &&
        (isBeadedAvailable || isNonBeadedAvailable) && (
          <div>
            <h3 className="text-xs font-medium text-gray-900">Style</h3>
            {renderStyleOptions()}
          </div>
        )}

      {/* PRODUCT TYPE OPTIONS */}
      {product.type === "kurta" && product.options && (
        <div>
          <h3 className="text-xs font-medium text-gray-900">Product Type</h3>
          <div className="mt-1 flex space-x-2">
            <button
              onClick={() => setIsFullSet(false)}
              className={`py-1.5 px-3 rounded-md text-sm ${
                !isFullSet ? "border-gray-800" : "border-gray-200"
              } border bg-gray-50 text-gray-800`}
            >
              Kurta
            </button>
            <button
              onClick={() => setIsFullSet(true)}
              className={`py-1.5 px-3 rounded-md text-sm ${
                isFullSet ? "border-gray-800" : "border-gray-200"
              } border bg-gray-50 text-gray-800`}
            >
              Full Set
            </button>
          </div>
        </div>
      )}
      {product?.dhotis?.length > 0 && renderDhotiOptions()}
    </div>
  );
};

export default ProductOptions;
