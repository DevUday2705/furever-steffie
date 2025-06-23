import React, { useState } from "react";

import { motion } from "framer-motion";
import ColorSelector from "../ColorSelector";
import { CheckCircle, Gift } from "lucide-react";
import Lottie from "react-lottie";

import confettiAnimation from "../../../public/animation/confetti.json";

const confettiOptions = {
  loop: false,
  autoplay: true,
  animationData: confettiAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const ProductOptions = ({
  product,
  isBeaded,
  setIsBeaded,
  isFullSet,
  setIsFullSet,
  selectedDhoti,
  setSelectedDhoti,
  selectedColor, // NEW
  setSelectedColor,
  isRoyalSet,
  setIsRoyalSet,
  selectedStyle,
  setSelectedStyle,
}) => {
  const [showRoyalDescription, setShowRoyalDescription] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
  };
  const { isBeadedAvailable, isNonBeadedAvailable } = product;

  const handleRoyalSetClick = () => {
    setIsRoyalSet(true);
    setIsFullSet(true); // Royal set includes dhoti
    setShowRoyalDescription(true);
    // Trigger confetti animation
    setShowConfetti(true);

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    // Hide description after 5 seconds
  };

  const handleRegularOptionClick = (isFullSetOption) => {
    setIsRoyalSet(false);
    setIsFullSet(isFullSetOption);
    setShowRoyalDescription(false);
  };
  const renderStyleOptions = () => {
    const availableOptions = [];

    // Always available options
    availableOptions.push(
      { id: "simple", label: "Simple", description: "Classic look" },
      {
        id: "tassels",
        label: "Tassels",
        description: "With decorative tassels",
      }
    );

    // Add beaded options only if beaded is available
    if (product.isBeadedAvailable) {
      availableOptions.push(
        {
          id: "beaded",
          label: "Beaded Luxe",
          description: "Premium beaded design",
        },
        {
          id: "beaded-tassels",
          label: "Beaded + Tassels",
          description: "Ultimate luxury combo",
        }
      );
    }

    return (
      <div className="mt-1">
        <div className="grid grid-cols-2 gap-2">
          {availableOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedStyle(option.id)}
              className={`py-2 px-3 rounded-md text-sm border transition-all ${
                selectedStyle === option.id
                  ? "border-gray-800 bg-gray-100 text-gray-800 shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // // Helper function to get style display name
  // const getStyleDisplayName = (style) => {
  //   switch (style) {
  //     case "simple":
  //       return "Simple";
  //     case "tassels":
  //       return "With Tassels";
  //     case "beaded":
  //       return "Beaded Luxe";
  //     case "beaded-tassels":
  //       return "Beaded + Tassels";
  //     default:
  //       return "Simple";
  //   }
  // };

  // // Usage in product display/cart
  // const displaySelectedOptions = () => {
  //   return (
  //     <div className="text-sm text-gray-600">
  //       <p>Style: {getStyleDisplayName(selectedStyle)}</p>
  //       <p>Size: {selectedSize}</p>
  //       {isFullSet && <p>Full Set: Yes</p>}
  //       {isRoyalSet && <p>Royal Set: Yes</p>}
  //     </div>
  //   );
  // };

  const renderDhotiOptions = () => {
    if (!isFullSet || product.type !== "kurta") return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <h3 className="text-xs font-medium text-gray-900 mb-3">Dhoti Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {product.dhotis.map((dhoti) => (
            <motion.div
              key={dhoti.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDhoti(dhoti.id)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedDhoti === dhoti.id
                  ? "border-gray-800"
                  : "border-transparent"
              }`}
            >
              <div className="relative pb-3/4 h-20">
                <img
                  src={dhoti.image}
                  alt={dhoti.name}
                  className="absolute h-full w-full object-contain"
                />
              </div>
              <div className="p-1 bg-gray-50">
                <p className="text-xs font-medium text-center text-gray-800 truncate">
                  {dhoti.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="px-4 pb-4 space-y-4">
      <ColorSelector
        colors={product.colors}
        selectedColor={selectedColor}
        onColorSelect={handleColorChange}
      />

      {/* STYLE OPTIONS */}
      {["kurta", "lehnga", "tuxedo"].includes(product.type) &&
        (isBeadedAvailable || isNonBeadedAvailable) && (
          <div>
            <h3 className="text-xs font-medium text-gray-900">Style</h3>
            {renderStyleOptions()}
          </div>
        )}

      {/* PRODUCT TYPE OPTIONS */}
      {product.type === "kurta" && product.options && (
        <div>
          <h3 className="text-xs font-medium text-gray-900">Product Type</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {/* Regular Kurta Option */}
            <button
              onClick={() => handleRegularOptionClick(false)}
              className={`py-1.5 px-3 rounded-md text-sm transition-all duration-200 ${
                !isFullSet && !isRoyalSet
                  ? "border-gray-800 bg-gray-100"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              } border text-gray-800`}
            >
              Kurta
            </button>

            {/* Regular Kurta + Dhoti Option */}
            <button
              onClick={() => handleRegularOptionClick(true)}
              className={`py-1.5 px-3 rounded-md text-sm transition-all duration-200 ${
                isFullSet && !isRoyalSet
                  ? "border-gray-800 bg-gray-100"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              } border text-gray-800`}
            >
              Kurta + Dhoti
            </button>

            {/* Royal Set Option - Only for Royal category */}
            <div className="relative">
              {/* Your existing Royal Set button */}
              {product.category === "royal" && (
                <button
                  onClick={handleRoyalSetClick}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${
                    isRoyalSet
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-2 border-emerald-400 shadow-xl ring-4 ring-emerald-200 ring-opacity-50"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {isRoyalSet ? (
                      <>
                        <CheckCircle size={20} className="animate-pulse" />
                        <span className="font-bold">Royal Set Selected ✓</span>
                      </>
                    ) : (
                      <>
                        <Gift size={20} />
                        <span>Full Royal Set</span>
                      </>
                    )}
                  </span>

                  {isRoyalSet ? (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse"></div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  )}
                </button>
              )}

              {/* Confetti Animation Overlay */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  <Lottie
                    options={confettiOptions}
                    height="100vh"
                    width="100vw"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Royal Set Description */}
          {showRoyalDescription && isRoyalSet && (
            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg animate-fadeIn">
              <div className="flex items-start gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <h4 className="font-semibold text-purple-800 text-sm">
                    Royal Experience for Your Pet
                  </h4>
                  <p className="text-xs text-purple-700 mt-1">
                    Comes with Premium packaging, Kurta, Dhoti, Tassels, Dupatta
                    and a Free gift.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {product?.dhotis?.length > 0 && renderDhotiOptions()}
    </div>
  );
};

export default ProductOptions;
