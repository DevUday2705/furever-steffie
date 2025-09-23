import React, { useState } from "react";
import { toast } from "react-hot-toast";

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
  XXXL: {
    neck: 24,
    chest: "28-30",
    length: 21,
    breed: "Indie",
  },
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

const SimpleSizeSelector = ({
  selectedSize,
  setSelectedSize,
  product,
  // Action button props
  images = [],
  isBeaded = false,
  isFullSet = false,
  isDupattaSet = false,
  isRoyalSet = false,
  selectedDhoti = null,
  selectedStyle = "simple",
  selectedColor = null,
  calculatePrice = () => 0,
  navigate = () => {},
  addToCart = () => {},
  setIsOpen = () => {},
}) => {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");

  // Check if size is available in stock
  const isSizeAvailable = (size) => {
    if (!product?.sizeStock) return true;
    return product.sizeStock[size] > 0;
  };

  // Get stock count for a size
  const getStockCount = (size) => {
    return product?.sizeStock?.[size] || 0;
  };

  // Get price increment for size
  const getSizePrice = (size) => {
    return product?.pricing?.sizeIncrements?.[size] || 0;
  };

  const handleSizeSelect = (size) => {
    if (isSizeAvailable(size)) {
      setSelectedSize(size);
    }
  };

  // Action button functions (copied from BottomActions)
  const handleBuyNow = () => {
    // Find selected dhoti details if dhoti is selected
    const selectedDhotiDetails =
      selectedDhoti && product.dhotis
        ? product.dhotis.find((dhoti) => dhoti.name === selectedDhoti)
        : null;

    const orderDetails = {
      productId: product.id,
      name: product.name,
      category: product.category || product.type,
      subcategory: product.subcategory,
      isBeaded,
      isRoyalSet,
      isFullSet,
      isDupattaSet,
      selectedDhoti,
      selectedDhotiDetails,
      selectedStyle,
      selectedSize,
      selectedColor,
      price: calculatePrice(),
      image: images[0],
      measurements: null, // For simplified sizing, we don't need measurements
    };
    setShowSizeGuide(false); // Close modal
    navigate("/checkout", { state: { orderDetails, sizeConfirmed: true } });
  };

  const handleAddToCart = () => {
    // Find selected dhoti details if dhoti is selected
    const selectedDhotiDetails =
      selectedDhoti && product.dhotis
        ? product.dhotis.find((dhoti) => dhoti.name === selectedDhoti)
        : null;

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category || product.type,
      subcategory: product.subcategory,
      isBeaded,
      isFullSet,
      isDupattaSet,
      isRoyalSet,
      selectedDhoti,
      selectedDhotiDetails,
      selectedStyle,
      selectedSize,
      selectedColor,
      price: calculatePrice(),
      image: images[0],
      quantity: 1,
      measurements: null, // For simplified sizing, we don't need measurements
    });

    toast.success("Added To Cart");
    setShowSizeGuide(false); // Close modal
    setIsOpen(true);
  };

  // Check if actions should be enabled
  const shouldEnableActions = () => {
    if (!selectedSize) return false;
    if (!isSizeAvailable(selectedSize)) return false;
    return true;
  };

  const selectedSizeData = selectedSize ? SIZE_CHART[selectedSize] : null;

  return (
    <div className="space-y-4 p-4">
      {/* Size Selection Header - Modern Style */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          SELECT SIZE
        </h3>
        <button
          className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
          onClick={() => setShowSizeGuide(true)}
        >
          SIZE CHART →
        </button>
      </div>

      {/* Size Options - Myntra Style Horizontal Layout */}
      <div className="flex gap-3 flex-wrap">
        {AVAILABLE_SIZES.map((size) => {
          const isAvailable = isSizeAvailable(size);
          const stockCount = getStockCount(size);
          const isSelected = selectedSize === size;
          const priceIncrement = getSizePrice(size);

          return (
            <div key={size} className="flex flex-col items-center">
              <button
                onClick={() => handleSizeSelect(size)}
                disabled={!isAvailable}
                className={`
                  w-12 h-12 rounded-full border-2 text-sm font-semibold transition-all relative
                  ${
                    isSelected
                      ? "border-gray-600 bg-gray-50 text-gray-600"
                      : isAvailable
                      ? "border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:shadow-sm"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {size}

                {/* Stock indicator for low stock */}
                {isAvailable && stockCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {stockCount}
                  </span>
                )}

                {/* Out of stock indicator */}
              </button>

              {/* Price increment display */}
              {isAvailable && priceIncrement > 0 && (
                <span className="text-xs text-gray-600 mt-1">
                  +₹{priceIncrement}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Size Info Card - Clean Design */}
      {selectedSize && selectedSizeData && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Size {selectedSize} Measurements
            </h4>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Selected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Neck
              </div>
              <div className="text-lg font-bold text-gray-900">
                {selectedSizeData.neck}"
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Chest
              </div>
              <div className="text-lg font-bold text-gray-900">
                {selectedSizeData.chest}"
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Length
              </div>
              <div className="text-lg font-bold text-gray-900">
                {selectedSizeData.length}"
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-700 bg-white/60 rounded-lg p-2">
            <span className="font-medium">Recommended for:</span>{" "}
            {selectedSizeData.breed}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden w-full flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Size Guide
                </h2>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTab("chart")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "chart"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Size Chart
                </button>
                <button
                  onClick={() => setActiveTab("measure")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "measure"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  How to Measure
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "chart" && (
                <div className="space-y-6">
                  {/* Size Selection within Modal */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Select a size to see details
                    </h3>
                    <div className="space-y-2">
                      {AVAILABLE_SIZES.map((size) => {
                        const sizeData = SIZE_CHART[size];
                        const isAvailable = isSizeAvailable(size);
                        const isSelected = selectedSize === size;

                        return (
                          <label
                            key={size}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-gray-600 bg-pink-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            } ${
                              !isAvailable
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="size"
                              value={size}
                              checked={isSelected}
                              onChange={() => setSelectedSize(size)}
                              disabled={!isAvailable}
                              className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                            />
                            <div className="ml-3 flex-1 grid grid-cols-4 gap-4 text-sm">
                              <div className="font-semibold">{size}</div>
                              <div className="text-gray-600">
                                {sizeData.neck}"
                              </div>
                              <div className="text-gray-600">
                                {sizeData.chest}"
                              </div>
                              <div className="text-gray-600">
                                {sizeData.length}"
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Chart Table */}
                  <div className="overflow-x-auto">
                    <div className="bg-gray-100 p-3 rounded-t-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-700">
                        <div>SIZE</div>

                        <div>RECOMMENDED BREEDS</div>
                      </div>
                    </div>
                    <div className="bg-white border border-t-0 rounded-b-lg">
                      {AVAILABLE_SIZES.map((size) => {
                        const sizeData = SIZE_CHART[size];
                        const isSelected = selectedSize === size;
                        const isAvailable = isSizeAvailable(size);

                        return (
                          <div
                            key={size}
                            className={`grid grid-cols-2 gap-4 p-3 text-sm border-b last:border-b-0 ${
                              isSelected ? "bg-pink-50" : ""
                            } ${!isAvailable ? "opacity-50" : ""}`}
                          >
                            <div className="font-medium">{size}</div>

                            <div className="text-gray-600 text-xs">
                              {sizeData.breed}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    * Pet Measurements in Inches • Contact 8821456667 for larger
                    (8XL & CUSTOMIZED SIZE)
                  </div>
                </div>
              )}

              {activeTab === "measure" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      How to measure your pet
                    </h3>

                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <img
                        src="/images/2.png"
                        alt="Pet measurement guide - How to measure neck, chest, and length"
                        className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                      />
                    </div>

                    {/* Measurement Video */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <video
                        controls
                        className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                        poster="/images/2.png"
                      >
                        <source
                          src="/images/measurements.mp4"
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Video guide: How to measure your pet correctly
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-900 mb-2">
                          Neck
                        </div>
                        <div className="text-sm text-gray-600">
                          Measure around the base of your pet's neck where the
                          collar sits
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-900 mb-2">
                          Chest
                        </div>
                        <div className="text-sm text-gray-600">
                          Measure around the widest part of your pet's chest,
                          behind the front legs
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-900 mb-2">
                          Length
                        </div>
                        <div className="text-sm text-gray-600">
                          Measure from the base of the neck to the base of the
                          tail
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="border-t border-gray-200 p-6 flex-shrink-0 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={!shouldEnableActions()}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all ${
                    shouldEnableActions()
                      ? "bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Buy Now - ₹{calculatePrice()}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!shouldEnableActions()}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all border-2 ${
                    shouldEnableActions()
                      ? "border-pink-600 text-pink-600 hover:bg-pink-50"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
              </div>

              {!selectedSize && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please select a size to continue
                </p>
              )}

              {selectedSize && !isSizeAvailable(selectedSize) && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Selected size is out of stock
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSizeSelector;
