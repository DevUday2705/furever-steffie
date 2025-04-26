// src/components/ProductDetail/ProductInfo.jsx

import React from "react";

const ProductInfo = ({ product, calculatePrice }) => {
  return (
    <div className="p-4">
      {/* Subcategory */}
      {product.subcategory && (
        <div className="text-xs font-medium text-gray-600">
          {product.subcategory}
        </div>
      )}

      {/* Name */}
      <h1 className="text-xl font-bold text-gray-800 mt-1">{product.name}</h1>

      {/* Price */}
      <div className="mt-2 text-2xl font-bold text-gray-800">
        ₹{calculatePrice()}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-600">{product.description}</p>
    </div>
  );
};

export default ProductInfo;
