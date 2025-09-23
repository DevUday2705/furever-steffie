import React, { useState } from "react";

// Size chart data based on the provided chart
const SIZE_CHART = {
  XS: {
    neck: 11,
    chest: 16,
    length: 15,
    breed: "Maltese, toy poodle, toy Pom, Yorkie",
  },
  S: {
    neck: 14,
    chest: 20,
    length: 16.5,
    breed: "Imperial Shihtzu, poodle, bichon frise",
  },
  M: {
    neck: 15,
    chest: 22,
    length: 17,
    breed: "Regular shihtzu, imperial lhasa",
  },
  L: {
    neck: 18,
    chest: 24,
    length: 18.5,
    breed: "Regular lhasa, dachshund, Pom",
  },
  XL: {
    neck: 20,
    chest: "24-26",
    length: 19,
    breed: "Golden doodle, pugs, frenchie, Pomeranian",
  },
  XXL: {
    neck: 22,
    chest: "26-28",
    length: 20.5,
    breed: "Cocker spaniel, beagle",
  },
  XXXL: { neck: 24, chest: "28-30", length: 21, breed: "Indie" },
  "4XL": {
    neck: "26-29",
    chest: "31-36",
    length: "22-26",
    breed: "Labrador, golden retriever, husky",
  },
  "5XL": {
    neck: "26-29",
    chest: "31-36",
    length: "22-26",
    breed: "Large breeds",
  },
  "6XL": {
    neck: "26-29",
    chest: "31-36",
    length: "22-26",
    breed: "Extra large breeds",
  },
};

const AVAILABLE_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "4XL",
  "5XL",
  "6XL",
];

const SimpleSizeSelector = ({ selectedSize, setSelectedSize, product }) => {
  const [showMeasurements, setShowMeasurements] = useState(false);

  // Check if size is available in stock
  const isSizeAvailable = (size) => {
    if (!product?.sizeStock) return true; // If no stock data, assume available
    return product.sizeStock[size] > 0;
  };

  // Get stock count for a size
  const getStockCount = (size) => {
    return product?.sizeStock?.[size] || 0;
  };

  const handleSizeSelect = (size) => {
    if (isSizeAvailable(size)) {
      setSelectedSize(size);
      setShowMeasurements(true);
    }
  };

  const selectedSizeData = SIZE_CHART[selectedSize];

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      {/* Size Selection Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">SELECT SIZE</h3>
        <button
          className="text-xs text-red-500 underline hover:text-red-700"
          onClick={() => setShowMeasurements(!showMeasurements)}
        >
          SIZE CHART →
        </button>
      </div>

      {/* Size Options Grid */}
      <div className="grid grid-cols-5 gap-2">
        {AVAILABLE_SIZES.map((size) => {
          const isAvailable = isSizeAvailable(size);
          const stockCount = getStockCount(size);
          const isSelected = selectedSize === size;

          return (
            <div key={size} className="relative">
              <button
                onClick={() => handleSizeSelect(size)}
                disabled={!isAvailable}
                className={`
                  w-full py-2 px-1 rounded-lg text-xs font-semibold transition-all relative
                  ${
                    isSelected
                      ? "bg-gray-800 text-white"
                      : isAvailable
                      ? "bg-white border border-gray-300 text-gray-800 hover:border-gray-400 hover:shadow-sm"
                      : "bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {size}
                {/* Stock indicator for low stock */}
                {isAvailable && stockCount > 0 && stockCount <= 3 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {stockCount}
                  </span>
                )}
                {/* Out of stock indicator */}
                {!isAvailable && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    ✕
                  </span>
                )}
              </button>

              {/* Price display based on size increments */}
              {isAvailable && product?.pricing?.sizeIncrements?.[size] && (
                <div className="text-xs text-center text-gray-500 mt-1">
                  +₹{product.pricing.sizeIncrements[size]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Size Measurements */}
      {selectedSize && selectedSizeData && (
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">
              Size {selectedSize} Measurements
            </h4>
            <span className="text-xs text-green-600 font-medium">
              ✓ Selected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <div className="text-xs text-gray-500">Neck</div>
              <div className="font-semibold text-gray-800">
                {selectedSizeData.neck}"
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Chest</div>
              <div className="font-semibold text-gray-800">
                {selectedSizeData.chest}"
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Length</div>
              <div className="font-semibold text-gray-800">
                {selectedSizeData.length}"
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">Recommended for:</span>{" "}
            {selectedSizeData.breed}
          </div>
        </div>
      )}

      {/* Size Chart Modal/Expandable */}
      {showMeasurements && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">
              Complete Size Chart
            </h4>
            <button
              onClick={() => setShowMeasurements(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left font-semibold">SIZE</th>
                  <th className="p-2 text-center font-semibold">NECK</th>
                  <th className="p-2 text-center font-semibold">CHEST</th>
                  <th className="p-2 text-center font-semibold">LENGTH</th>
                  <th className="p-2 text-left font-semibold">BREED</th>
                </tr>
              </thead>
              <tbody>
                {AVAILABLE_SIZES.map((size) => {
                  const sizeData = SIZE_CHART[size];
                  const isAvailable = isSizeAvailable(size);

                  return (
                    <tr
                      key={size}
                      className={`border-b ${
                        !isAvailable ? "opacity-50 bg-gray-50" : ""
                      } ${selectedSize === size ? "bg-blue-50" : ""}`}
                    >
                      <td className="p-2 font-semibold">
                        {size}
                        {!isAvailable && (
                          <span className="text-red-500 ml-1">✕</span>
                        )}
                      </td>
                      <td className="p-2 text-center">{sizeData.neck}</td>
                      <td className="p-2 text-center">{sizeData.chest}</td>
                      <td className="p-2 text-center">{sizeData.length}</td>
                      <td className="p-2 text-gray-600">{sizeData.breed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Contact 8821456667 for larger (8XL & CUSTOMIZED SIZE)
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSizeSelector;
