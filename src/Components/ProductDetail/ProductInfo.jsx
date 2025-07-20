import React, { useContext, useState } from "react";
import { Crown, ChevronDown, ChevronUp } from "lucide-react";
import PremiumBadge from "../PremiumBadge";
import { convertCurrency } from "../../constants/currency";
import { CurrencyContext } from "../../context/currencyContext";

const ProductInfo = ({ product, calculatePrice }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const price = calculatePrice();
  const discountPercent = product.pricing.discountPercent || 0;
  const originalPrice =
    discountPercent > 0
      ? Math.round(price * (100 / (100 - discountPercent)))
      : price;

  const isPremium = product.category === "royal";
  const { currency, rate } = useContext(CurrencyContext);

  // Parse description into bullet points
  const parseDescription = (description) => {
    if (!description) return [];

    // Check if description contains bullet points
    if (description.includes("* ")) {
      return description
        .split("* ")
        .filter((point) => point.trim())
        .map((point) => point.trim());
    }

    // Return as single paragraph if no bullet points
    return [description];
  };

  const bulletPoints = parseDescription(product.description);
  const isBulletFormat =
    product.description && product.description.includes("* ");
  const visiblePoints = showFullDescription
    ? bulletPoints
    : bulletPoints.slice(0, 2);
  const hasMorePoints = bulletPoints.length > 2;

  // Process text to handle markdown-style formatting
  const processText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  return (
    <div className="px-4 pb-4">
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
        <span className="text-2xl font-semibold text-gray-900">
          {convertCurrency(price, currency)}
        </span>
        {discountPercent > 0 && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {convertCurrency(originalPrice, currency)}
            </span>
            <span className="text-sm font-medium text-emerald-600">
              {discountPercent}% off
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <div className="mt-4">
        {isBulletFormat ? (
          <ul className="space-y-3">
            {visiblePoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-1 hover:border-gray-200 transition-colors duration-200"
              >
                <p
                  className="text-sm leading-relaxed text-gray-700 flex-1"
                  dangerouslySetInnerHTML={{ __html: processText(point) }}
                />
              </li>
            ))}

            {hasMorePoints && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 mt-3 group"
              >
                {showFullDescription ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="w-4 h-4 group-hover:translate-y-[-1px] transition-transform duration-200" />
                  </>
                ) : (
                  <>
                    <span>See {bulletPoints.length - 2} more features</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-[1px] transition-transform duration-200" />
                  </>
                )}
              </button>
            )}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-gray-700">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
