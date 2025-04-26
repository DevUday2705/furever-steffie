import React from "react";

const ReadyMadeSizeSelector = ({
  selectedSize,
  setSelectedSize,
  sizes = ["S", "M", "L", "XL", "XXL"],
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md space-y-4">
      <div className="text-xs font-semibold text-gray-700">Select Size:</div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`py-1.5 px-4 rounded-md text-sm font-semibold transition-all ${
              selectedSize === size
                ? "bg-gray-800 text-white"
                : "bg-white border border-gray-300 text-gray-800"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReadyMadeSizeSelector;
