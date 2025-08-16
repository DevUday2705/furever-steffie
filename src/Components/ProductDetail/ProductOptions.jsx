import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import ColorSelector from "../ColorSelector";
import { CheckCircle, ChevronRight, Gift } from "lucide-react";
import Lottie from "react-lottie";

import confettiAnimation from "../../../public/animation/confetti.json";
import { Link } from "react-router-dom";

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
  isDupattaSet, // NEW
  setIsDupattaSet, // NEW
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
  const [isShining, setIsShining] = useState(false);
  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
  };
  const { isBeadedAvailable, isNonBeadedAvailable } = product;

  const handleRoyalSetClick = () => {
    setIsRoyalSet(true);
    setIsFullSet(true); // Royal set includes dhoti
    setIsDupattaSet(false); // Reset dupatta when royal is selected
    setShowRoyalDescription(true);
    // Trigger confetti animation
    setShowConfetti(true);

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    // Hide description after 5 seconds
  };

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      triggerShine();
    }, 1000);

    const intervalId = setInterval(() => {
      triggerShine();
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, []);

  const triggerShine = () => {
    setIsShining(true);
    setTimeout(() => setIsShining(false), 2500);
  };

  const handleRegularOptionClick = (
    isFullSetOption,
    isDupattaOption = false
  ) => {
    setIsRoyalSet(false);
    setIsFullSet(isFullSetOption);
    setIsDupattaSet(isDupattaOption);
    setShowRoyalDescription(false);
  };
  const renderStyleOptions = () => {
    const availableOptions = [];

    // Always available options
    if (product.type == "kurta" && !isRoyalSet) {
      availableOptions.push(
        { id: "simple", label: "Simple", description: "Classic look" },
        {
          id: "tassels",
          label: "Tassels",
          description: "With decorative tassels",
        }
      );
    }

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
      {["kurta", "lehnga"].includes(product.type) &&
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
          <div className="mt-1 space-y-2">
            {/* Regular options in a row */}
            <div className="flex flex-wrap gap-2">
              {/* Regular Kurta Option */}
              <button
                onClick={() => handleRegularOptionClick(false, false)}
                className={`py-1.5 flex-1 rounded-md text-sm transition-all duration-200 ${
                  !isFullSet && !isRoyalSet && !isDupattaSet
                    ? "border-gray-800 bg-gray-100"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                } border text-gray-800`}
              >
                Kurta
              </button>

              {/* Regular Kurta + Dhoti Option */}
              <button
                onClick={() => handleRegularOptionClick(true, false)}
                className={`py-1.5 flex-1 rounded-md text-sm transition-all duration-200 ${
                  isFullSet && !isRoyalSet && !isDupattaSet
                    ? "border-gray-800 bg-gray-100"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                } border text-gray-800`}
              >
                Kurta + Dhoti
              </button>

              {/* NEW: Kurta + Dupatta Option */}
              <button
                onClick={() => handleRegularOptionClick(false, true)}
                className={`py-1.5 flex-1 rounded-md text-sm transition-all duration-200 ${
                  isDupattaSet && !isRoyalSet
                    ? "border-gray-800 bg-gray-100"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                } border text-gray-800`}
              >
                Kurta + Dupatta
              </button>
            </div>

            {/* Royal Set Option - Full width */}
            {product.isRoyal && (
              <div className="relative w-full overflow-hidden rounded-md">
                <button
                  onClick={handleRoyalSetClick}
                  onMouseEnter={triggerShine}
                  className={`w-full inline-flex items-center justify-center px-6 py-1.5 font-medium rounded-md transition-all duration-300 shadow-md border border-[#e9d396] border-opacity-30
                    ${
                      isRoyalSet
                        ? "bg-gradient-to-r from-gray-700 to-gray-500 text-white border-2 border-gray-400 shadow-xl ring-4 ring-gray-200 ring-opacity-50"
                        : "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800 border-2 border-gray-300 hover:from-gray-300 hover:to-gray-200 hover:shadow-xl"
                    }
                  `}
                >
                  <Gift className="w-5 h-5 mr-2" />
                  {isRoyalSet ? "Royal Set Selected ✓" : "Full Royal Set"}
                </button>

                <motion.div
                  className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-gray-200/40 to-transparent opacity-30"
                  initial={{ x: "-100%", skewX: -30 }}
                  animate={isShining ? { x: "300%" } : { x: "-100%" }}
                  transition={
                    isShining
                      ? { duration: 1.5, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                />
              </div>
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
                    filter: "grayscale(0.7) brightness(0.95)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Royal Set Description */}
          {showRoyalDescription && isRoyalSet && (
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg animate-fadeIn">
              <div className="flex items-start gap-2">
                <span className="text-lg text-gray-400">✨</span>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Royal Experience for Your Pet
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
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
