import React, { useEffect, useState } from "react";

const ReadyMadeSizeSelector = ({
  selectedSize,
  setSelectedSize,
  sizes = ["S", "M", "L", "XL", "XXL"],
  onClearSavedSize, // new prop
}) => {
  const [savedSize, setSavedSize] = useState(null);

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
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`py-1.5 px-4 rounded-md text-sm font-semibold transition-all ${
              selectedSize === size
                ? "bg-gray-800 text-white"
                : "bg-white border border-gray-300 text-gray-800"
            }`}
            disabled={!!savedSize && savedSize !== size}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReadyMadeSizeSelector;
