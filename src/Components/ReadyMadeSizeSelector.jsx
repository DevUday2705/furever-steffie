import React, { useEffect, useState } from "react";

const ReadyMadeSizeSelector = ({
  selectedSize,
  setSelectedSize,
  sizes = ["S", "M", "L", "XL", "XXL"],
  onClearSavedSize, // new prop
  product, // NEW: to check stock
}) => {
  const [savedSize, setSavedSize] = useState(null);

  // Helper function to check if size is in stock
  const isSizeInStock = (size) => {
    // For sizes XS, S, M - check stock from product.sizeStock
    if (['XS', 'S', 'M'].includes(size)) {
      return product?.sizeStock?.[size] > 0;
    }
    // For L, XL, XXL+ - always available (manual management)
    return true;
  };

  // Helper function to get stock count
  const getStockCount = (size) => {
    if (['XS', 'S', 'M'].includes(size)) {
      return product?.sizeStock?.[size] || 0;
    }
    return null; // No stock display for manual sizes
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedPetSize");
    if (saved) {
      const { size } = JSON.parse(saved);
      setSavedSize(size);
      setSelectedSize(size);
    }
  }, [setSelectedSize]);

  const handleClearSavedSize = () => {
    localStorage.removeItem("savedPetSize");
    setSavedSize(null);
    setSelectedSize("");
    if (onClearSavedSize) onClearSavedSize(); // notify parent to show SmartPetSizing
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md space-y-4">
      <div className="text-xs font-semibold text-gray-700">Select Size:</div>
      {savedSize && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-700 text-xs font-semibold">
              Using your saved size: {savedSize}
            </span>
            <button
              onClick={handleClearSavedSize}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Size is selected for your pup as per your last selection.
            <br />
            You can clear and select a different size if you'd like.
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const inStock = isSizeInStock(size);
          const stockCount = getStockCount(size);
          const isSelected = selectedSize === size;
          const isDisabled = !inStock || (!!savedSize && savedSize !== size);
          
          return (
            <div key={size} className="relative">
              <button
                onClick={() => inStock && setSelectedSize(size)}
                className={`py-1.5 px-4 rounded-md text-sm font-semibold transition-all relative ${
                  isSelected
                    ? "bg-gray-800 text-white"
                    : inStock
                    ? "bg-white border border-gray-300 text-gray-800 hover:border-gray-400"
                    : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={isDisabled}
              >
                {size}
                {!inStock && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    ✕
                  </span>
                )}
              </button>
              {/* Show stock count for XS, S, M */}
              {inStock && stockCount !== null && stockCount <= 5 && (
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-orange-600 font-medium whitespace-nowrap">
                  {stockCount} left
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadyMadeSizeSelector;
