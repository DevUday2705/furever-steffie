import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useOrderPause } from "../context/OrderPauseContext";
import { useAppContext } from "../context/AppContext";

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
  "2XL": {
    neck: 22,
    chest: "26-28",
    length: 20.5,
    breed: "Cocker spaniel, beagle",
  },

  "4XL": {
    neck: "26-29",
    chest: "31-36",
    length: "22-26",
    breed: "Labrador, golden retriever, husky",
  },

  "6XL": {
    neck: "26-29",
    chest: "31-36",
    length: "22-26",
    breed: "Extra large breeds",
  },
};

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL"];

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
  // Custom sizing props
  allowCustomSizes = false,
}) => {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const { ordersArePaused } = useOrderPause();
  const { checkAndShowNotificationRequest } = useAppContext();
  
  // Check if size is available in stock
  const isSizeAvailable = (size) => {
    if (!product?.sizeStock) return true;
    return product.sizeStock[size] > 0;
  };
  // Check if selected size is a custom size (out of stock but custom allowed)
  const isCustomSize = selectedSize && !isSizeAvailable(selectedSize) && allowCustomSizes;
  
  console.log('Debug:', { selectedSize, isAvailable: isSizeAvailable(selectedSize), allowCustomSizes, isCustomSize });


  // Get stock count for a size
  const getStockCount = (size) => {
    return product?.sizeStock?.[size] || 0;
  };

  // Get price increment for size
  const getSizePrice = (size) => {
    return product?.pricing?.sizeIncrements?.[size] || 0;
  };

  const handleSizeSelect = (size) => {
    // Allow selection if size is available OR if custom sizes are allowed
    if (isSizeAvailable(size) || allowCustomSizes) {
      setSelectedSize(size);
    }
  };

  // Action button functions (copied from BottomActions)
  const handleBuyNow = () => {
    // Find selected dhoti details if dhoti is selected
    const selectedDhotiDetails =
      selectedDhoti && product.dhotis
        ? product.dhotis.find((dhoti) => dhoti.id === selectedDhoti)
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
        ? product.dhotis.find((dhoti) => dhoti.id === selectedDhoti)
        : null;

    const cartItem = {
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
      addedAt: Date.now(),
    };

    addToCart(cartItem);
    toast.success("🐕 Product has been added to cart! Your furry friend's style is secured.", {
      duration: 4000,
      position: 'top-center',
    });
    
    // Check if we should show notification permission request
    checkAndShowNotificationRequest();
    
    setShowSizeGuide(false); // Close modal
    setIsOpen(true);
  };

  // WhatsApp contact function for custom sizes
  const handleCustomSizeContact = () => {
    const message = `Hi! I'm interested in the ${product.name} (ID: ${product.id}) in size ${selectedSize}. Could you help me with a custom size order?`;
    const phoneNumber = "918821456667"; // WhatsApp business number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowSizeGuide(false); // Close modal
  };

  // Check if actions should be enabled
  const shouldEnableActions = () => {
    // If orders are paused, disable all actions
    if (ordersArePaused) return false;

    if (!selectedSize) return false;
    
    // Enable if size is available OR if it's a custom size
    if (isSizeAvailable(selectedSize) || isCustomSize) return true;
    
    return false;
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
      <div className="grid grid-cols-4 gap-3">
        {AVAILABLE_SIZES.map((size) => {
          const isAvailable = isSizeAvailable(size);
          const stockCount = getStockCount(size);
          const isSelected = selectedSize === size;
          const priceIncrement = getSizePrice(size);

          return (
            <div key={size} className="flex flex-col items-center">
              <button
                onClick={() => handleSizeSelect(size)}
                disabled={!isAvailable && !allowCustomSizes}
                className={`
                  w-full h-full rounded-xs border-1 text-sm font-semibold transition-all flex flex-col px-3 py-3 relative
                  ${
                    isSelected
                      ? "border-gray-600 bg-gray-50 text-gray-600"
                      : isAvailable
                      ? "border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:shadow-sm"
                      : allowCustomSizes
                      ? "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:shadow-sm"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                  
                `}
              >
                {size}

                {isAvailable && stockCount > 0 && stockCount <= 5 && (
                  <span className="text-red-300 font-thin text-xs">
                    {stockCount} left
                  </span>
                )}
                
                {/* Custom size indicator */}
                {!isAvailable && allowCustomSizes && (
                  <span className="text-green-600 font-medium text-xs">
                    Custom
                  </span>
                )}
                
                {/* Out of stock indicator for non-custom sizes */}
                {!isAvailable && !allowCustomSizes && (
                  <span className="text-gray-400 font-thin text-xs">
                    Out of stock
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Size Explanation */}
      {allowCustomSizes && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Custom Sizes Available!</span>
          </div>
          <p className="text-green-700 mt-1 ml-6">
            Fabric available • We'll stitch and deliver within 6-7 working days
          </p>
        </div>
      )}

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
                                : isAvailable
                                ? "border-gray-200 bg-white hover:border-gray-300"
                                : allowCustomSizes
                                ? "border-green-200 bg-green-50 hover:border-green-300"
                                : "border-gray-200 bg-white hover:border-gray-300 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <input
                              type="radio"
                              name="size"
                              value={size}
                              checked={isSelected}
                              onChange={() => setSelectedSize(size)}
                              disabled={!isAvailable && !allowCustomSizes}
                              className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                            />
                            <div className="ml-3 flex-1 grid grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{size}</span>
                                {!isAvailable && allowCustomSizes && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Custom
                                  </span>
                                )}
                                {!isAvailable && !allowCustomSizes && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
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
                            <div className="font-medium flex items-center gap-2">
                              {size}
                              {!isAvailable && allowCustomSizes && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Custom Available
                                </span>
                              )}
                              {!isAvailable && !allowCustomSizes && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                  Out of Stock
                                </span>
                              )}
                            </div>

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

                    {/* Measurement Video */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <video
                        autoPlay
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
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <img
                        src="/images/2.png"
                        alt="Pet measurement guide - How to measure neck, chest, and length"
                        className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                      />
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
              {isCustomSize ? (
                /* Custom Size WhatsApp Contact Button */
                <button
                  onClick={handleCustomSizeContact}
                  disabled={!shouldEnableActions()}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all ${
                    shouldEnableActions()
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.251"/>
                    </svg>
                    {ordersArePaused
                      ? "Orders Temporarily Paused"
                      : "Contact Us on WhatsApp for Custom Size"}
                  </span>
                </button>
              ) : (
                /* Regular Add to Cart Button */
                <button
                  onClick={handleAddToCart}
                  disabled={!shouldEnableActions()}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all ${
                    shouldEnableActions()
                      ? "bg-gray-800 text-white hover:bg-gray-900 shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6h18M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2m-1 0v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6h10z"
                      />
                    </svg>
                    {ordersArePaused
                      ? "Orders Temporarily Paused"
                      : `Add to Bag - ₹${calculatePrice()}`}
                  </span>
                </button>
              )}

              {!selectedSize && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please select a size to continue
                </p>
              )}

              {selectedSize && !isSizeAvailable(selectedSize) && !allowCustomSizes && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Selected size is out of stock
                </p>
              )}
              
              {isCustomSize && (
                <p className="text-xs text-green-600 text-center mt-2">
                  This size is available as a custom order - we'll stitch it specially for you!
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
