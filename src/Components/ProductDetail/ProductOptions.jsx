// src/components/ProductDetail/ProductOptions.jsx

import React from "react";

const ProductOptions = ({
  product,
  isBeaded,
  setIsBeaded,
  isFullSet,
  setIsFullSet,
  selectedSize,
  setSelectedSize,
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Style Selection */}
      {product.options && (
        <div>
          <h3 className="text-xs font-medium text-gray-900">Style</h3>
          <div className="mt-1 flex space-x-2">
            <button
              onClick={() => setIsBeaded(true)}
              className={`py-1.5 px-3 rounded-md text-sm ${
                isBeaded ? "border-gray-800" : "border-gray-200"
              } border bg-gray-50 text-gray-800`}
            >
              Hand Work
            </button>
            <button
              onClick={() => setIsBeaded(false)}
              className={`py-1.5 px-3 rounded-md text-sm ${
                !isBeaded ? "border-gray-800" : "border-gray-200"
              } border bg-gray-50 text-gray-800`}
            >
              Simple
            </button>
          </div>
        </div>
      )}

      {/* Product Type Selection */}
      {product.options && (
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

      {/* Size Selection */}
    </div>
  );
};

export default ProductOptions;
