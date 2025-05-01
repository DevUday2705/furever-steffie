import React from "react";

const ProductInfo = ({ product, calculatePrice }) => {
  const price = calculatePrice();

  // Use the discount percentage from the product data
  const discountPercent = product.pricing.discountPercent || 0;
  const originalPrice =
    discountPercent > 0
      ? Math.round(price * (100 / (100 - discountPercent)))
      : price;

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
      <div className="mt-2 flex items-baseline flex-wrap">
        <span className="text-2xl font-bold text-gray-800 mr-2">₹{price}</span>
        {discountPercent > 0 && (
          <>
            <span className="text-lg text-gray-500 line-through mr-2">
              ₹{originalPrice}
            </span>
            <span className="text-sm font-medium text-emerald-600">
              {discountPercent}% off
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-600">{product.description}</p>
    </div>
  );
};

export default ProductInfo;
