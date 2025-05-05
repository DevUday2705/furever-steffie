import React from "react";
import { Crown } from "lucide-react";
import PremiumBadge from "../PremiumBadge";

const ProductInfo = ({ product, calculatePrice }) => {
  const price = calculatePrice();
  const discountPercent = product.pricing.discountPercent || 0;
  const originalPrice =
    discountPercent > 0
      ? Math.round(price * (100 / (100 - discountPercent)))
      : price;

  const isPremium = product.category === "premium";

  return (
    <div className="p-4">
      {/* Subcategory */}
      {product.subcategory && (
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {product.subcategory}
        </div>
      )}

      {/* Product Name + Premium Badge */}
      <div className="flex items-center flex-wrap gap-2 mt-1">
        <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
        {isPremium && <PremiumBadge />}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline flex-wrap gap-2">
        <span className="text-2xl font-semibold text-gray-900">₹{price}</span>
        {discountPercent > 0 && (
          <>
            <span className="text-lg text-gray-400 line-through">
              ₹{originalPrice}
            </span>
            <span className="text-sm font-medium text-emerald-600">
              {discountPercent}% off
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="mt-4 text-sm leading-relaxed text-gray-700">
        {product.description}
      </p>
    </div>
  );
};

export default ProductInfo;
