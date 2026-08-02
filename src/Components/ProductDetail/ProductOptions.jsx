import { useEffect, useState, useMemo } from "react";

import { AnimatePresence, motion } from "framer-motion";
import ColorSelector from "../ColorSelector";
import { Gift, X, Clock, AlertCircle } from "lucide-react";
import Lottie from "react-lottie";

import confettiAnimation from "../../../public/animation/confetti.json";
import { getAvailableDhtoisForSize, getGlobalSettings } from "../../utils/dhotiInventoryUtils";

const confettiOptions = {
  loop: false,
  autoplay: true,
  animationData: confettiAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL", "8XL"];

const ProductOptions = ({
  product,
  isBeaded,
  setIsBeaded,
  isFullSet,
  setIsFullSet,
  isDupattaSet, // NEW
  setIsDupattaSet, // NEW
  selectedSize, // NEW - to control availability of dhoti/royal
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
  const [showDhotiUnavailableModal, setShowDhotiUnavailableModal] = useState(false);
  const [availableDhtois, setAvailableDhtois] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [dhotiLoading, setDhotiLoading] = useState(false);

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
  };

  const { isBeadedAvailable, isNonBeadedAvailable } = product;

  const sizeAvailability = useMemo(() => {
    if (!product?.sizeStock) {
      return {
        hasManagedInventory: false,
        inStockSizes: [],
        lowStockSizes: [],
        outOfStockSizes: [],
      };
    }

    const inStockSizes = [];
    const lowStockSizes = [];
    const outOfStockSizes = [];

    SIZE_ORDER.forEach((size) => {
      const stock = product.sizeStock[size] || 0;
      if (stock > 0) {
        inStockSizes.push(size);
        if (stock <= 5) {
          lowStockSizes.push(size);
        }
      } else {
        outOfStockSizes.push(size);
      }
    });

    return {
      hasManagedInventory: true,
      inStockSizes,
      lowStockSizes,
      outOfStockSizes,
    };
  }, [product]);

  const handleJumpToSizeSelection = () => {
    document
      .getElementById("size-selection-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Load global settings and available dhotis on component mount
  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const settings = await getGlobalSettings();
        setGlobalSettings(settings);
      } catch (error) {
        console.error('Error loading global settings:', error);
      }
    };

    loadGlobalSettings();
  }, []);

  // Load available dhotis when size changes
  useEffect(() => {
    const loadAvailableDhtois = async () => {
      if (!selectedSize || !globalSettings) return;
      
      const dhotiManagementEnabled = globalSettings?.features?.dhotiManagementEnabled;
      
      if (dhotiManagementEnabled) {
        // Use centralized dhoti inventory system
        setDhotiLoading(true);
        try {
          const dhtois = await getAvailableDhtoisForSize(selectedSize);
          setAvailableDhtois(dhtois);
          
          // If current selected dhoti is not available for this size, reset it
          if (selectedDhoti && !dhtois.some(d => d.id === selectedDhoti)) {
            setSelectedDhoti(null);
          }
          
          // Auto-select first dhoti if none selected AND full set is enabled
          if (!selectedDhoti && dhtois.length > 0 && isFullSet) {
            setSelectedDhoti(dhtois[0].id);
          }
        } catch (error) {
          console.error('Error loading available dhotis:', error);
          setAvailableDhtois([]);
        } finally {
          setDhotiLoading(false);
        }
      } else {
        // Fallback to product-specific dhotis
        if (product?.dhotis && product.dhotis.length > 0) {
          const productDhotis = product.dhotis.map(dhoti => ({
            id: dhoti.name?.toLowerCase() || dhoti.id,
            name: dhoti.name,
            image: dhoti.image,
            availableStock: 999 // Product-specific dhotis are always available
          }));
          setAvailableDhtois(productDhotis);
          
          // Auto-select first dhoti if none selected AND full set is enabled
          if (!selectedDhoti && productDhotis.length > 0 && isFullSet) {
            setSelectedDhoti(productDhotis[0].id);
          }
        } else {
          setAvailableDhtois([]);
        }
      }
    };

    loadAvailableDhtois();
  }, [selectedSize, selectedDhoti, globalSettings, product]);


  const handleRoyalSetClick = () => {
    // Check if royal set is enabled globally and dhotis are available
    if (!globalSettings?.features?.royalSetEnabled || availableDhtois.length === 0) {
      setShowDhotiUnavailableModal(true);
      return;
    }

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
  };

  // Check if dhoti/royal options are enabled globally and available for selected size
  const dhotiManagementEnabled = globalSettings?.features?.dhotiManagementEnabled;
  const kurtaDhotiEnabled = globalSettings?.features?.kurtaDhotiEnabled && 
    (dhotiManagementEnabled ? availableDhtois.length > 0 : product?.dhotis?.length > 0);
  const kurtaDupattaEnabled = globalSettings?.features?.kurtaDupattaEnabled;
  const royalSetEnabled = globalSettings?.features?.royalSetEnabled && 
    (dhotiManagementEnabled ? availableDhtois.length > 0 : product?.dhotis?.length > 0);

  // If user switches to a size where dhotis are not available, clear dhoti-related selections
  useEffect(() => {
    if (availableDhtois.length === 0) {
      if (isRoyalSet) setIsRoyalSet(false);
      if (isFullSet) setIsFullSet(false);
      if (selectedDhoti) setSelectedDhoti(null);
    }
    
    // Clear dupatta set if dupatta is not enabled globally
    if (!kurtaDupattaEnabled && isDupattaSet) {
      setIsDupattaSet(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, availableDhtois.length, kurtaDhotiEnabled, royalSetEnabled, kurtaDupattaEnabled]);

  // Clear dhoti selection when neither royal set nor full set is selected
  useEffect(() => {
    if (!isRoyalSet && !isFullSet && selectedDhoti) {
      setSelectedDhoti(null);
    }
  }, [isRoyalSet, isFullSet, selectedDhoti, setSelectedDhoti]);

  const handleRegularOptionClick = (
    isFullSetOption,
    isDupattaOption = false
  ) => {
    setIsRoyalSet(false);
    setIsFullSet(isFullSetOption);
    setIsDupattaSet(isDupattaOption);
    setShowRoyalDescription(false);
    
    // Clear dhoti selection if not selecting full set
    if (!isFullSetOption && selectedDhoti) {
      setSelectedDhoti(null);
    }
  };

  const getStylePreviewImage = (styleId) => {
    const fallbackImages = [product?.mainImage, product?.image, product?.images?.[0]];

    if (styleId === "simple") {
      return product?.options?.nonBeaded?.images?.[0] || fallbackImages.find(Boolean) || "";
    }

    if (styleId.startsWith("beaded")) {
      return product?.options?.beaded?.images?.[0] || product?.options?.nonBeaded?.images?.[0] || fallbackImages.find(Boolean) || "";
    }

    return product?.options?.nonBeaded?.images?.[0] || fallbackImages.find(Boolean) || "";
  };

  const getStylePriceDelta = (styleId) => {
    switch (styleId) {
      case "simple":
        return "Included";
      case "tassels":
        return `+₹${product?.pricing?.tasselsAdditional || 150}`;
      case "beaded":
        return `+₹${product?.pricing?.beadedAdditional || 250}`;
      case "beaded-tassels":
        return `+₹${(product?.pricing?.beadedAdditional || 250) + (product?.pricing?.tasselsAdditional || 150)}`;
      default:
        return "Included";
    }
  };

  const handleStyleOptionClick = (optionId) => {
    setSelectedStyle(optionId);
    if (optionId === "simple") {
      setIsBeaded(false);
    } else {
      setIsBeaded(true);
    }
  };

  const getTierPrice = (tierKey) => {
    if (!product) return 0;

    let price = product.pricing.basePrice;

    if (tierKey === "royal") {
      price += (product.pricing.fullSetAdditional || 0) + 300;
    } else if (tierKey === "kurta-dhoti") {
      price += product.pricing.fullSetAdditional || 0;
    } else if (tierKey === "kurta-dupatta") {
      price += 200;
    }

    switch (selectedStyle) {
      case "beaded":
        price += product.pricing.beadedAdditional || 0;
        break;
      case "beaded-tassels":
        price += (product.pricing.beadedAdditional || 0) + (product.pricing.tasselsAdditional || 0);
        break;
      case "tassels":
        price += product.pricing.tasselsAdditional || 0;
        break;
      default:
        break;
    }

    const mappedSize = { Small: "S", Medium: "M", Large: "L", XL: "XL", XXL: "XXL" }[selectedSize] || selectedSize;
    price += product.pricing.sizeIncrements?.[mappedSize] ?? 0;

    return price;
  };

  const renderStyleOptions = () => {
    const availableOptions = [];

    // Always available options (respect product-level disables)
    if ((product.type == "kurta" || product.type == "pathani") && !isRoyalSet) {
      if (!product.disableSimpleOption) {
        availableOptions.push({ id: "simple", label: "Simple", description: "Classic look" });
      }
      if (!product.disableTasselsOption) {
        availableOptions.push({ id: "tassels", label: "Tassels", description: "With decorative tassels" });
      }
    }

    // Add beaded options only if beaded is available and not disabled for this product
    if (product.isBeadedAvailable && !product.disableBeadedOption) {
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
      <div className="mt-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {availableOptions.map((option) => {
            const disableSimple = !!product.disableSimpleOption;
            const disableBeaded = !!product.disableBeadedOption;
            const disableTassels = !!product.disableTasselsOption;

            let isDisabled = false;
            if (option.id === "simple") isDisabled = disableSimple;
            else if (option.id === "tassels") isDisabled = disableTassels;
            else if (option.id.startsWith("beaded")) {
              isDisabled = disableBeaded || (option.id.includes("tassels") && disableTassels);
            }

            const isSelected = selectedStyle === option.id;
            const previewImage = getStylePreviewImage(option.id);

            return (
              <button
                key={option.id}
                onClick={() => !isDisabled && handleStyleOptionClick(option.id)}
                disabled={isDisabled}
                title={isDisabled ? "Option disabled for this product" : ""}
                className={`min-w-[108px] flex-1 rounded-xl border p-2 text-left transition-all ${
                  isSelected
                    ? "border-[#1D9E75] bg-emerald-50 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="mb-2 h-16 overflow-hidden rounded-lg bg-gray-50">
                  {previewImage ? (
                    <img src={previewImage} alt={option.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                      Preview
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-gray-800">{option.label}</div>
                <div className="text-[11px] text-gray-500">{getStylePriceDelta(option.id)}</div>
              </button>
            );
          })}
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
    if (!isFullSet || (product.type !== "kurta" && product.type !== "pathani")) return null;
    
    if (dhotiLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <h3 className="text-xs font-medium text-gray-900 mb-3">Loading Dhoti Options...</h3>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
          </div>
        </motion.div>
      );
    }

    if (availableDhtois.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <h3 className="text-xs font-medium text-gray-900 mb-3">Dhoti Color</h3>
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No dhotis available for size {selectedSize}</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting a different size</p>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <h3 className="text-xs font-medium text-gray-900 mb-3">
          Dhoti Color ({availableDhtois.length} available)
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {availableDhtois.map((dhoti) => (
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
      {["kurta", "pathani", "lehnga"].includes(product.type) &&
        (isBeadedAvailable || isNonBeadedAvailable) && (
          <div>
            <h3 className="text-xs font-medium text-gray-900">Step 1 • Style</h3>
            {renderStyleOptions()}
          </div>
        )}

      {/* PRODUCT TYPE OPTIONS */}
      {(product.type === "kurta" || product.type === "pathani") && product.options && (
        <div>
          <h3 className="text-xs font-medium text-gray-900">Step 2 • Product Type</h3>
          <div className="mt-2 space-y-2">
            {[
              {
                key: "kurta",
                title: "Kurta only",
                description: "Classic kurta with no extras",
                price: getTierPrice("kurta"),
                isSelected: !isFullSet && !isRoyalSet && !isDupattaSet && !showRoyalDescription,
                onClick: () => handleRegularOptionClick(false, false),
                showBadge: false,
              },
              {
                key: "kurta-dhoti",
                title: "Kurta + Dhoti",
                description: "A polished kurta-and-dhoti pairing",
                price: getTierPrice("kurta-dhoti"),
                isSelected: isFullSet && !isRoyalSet && !isDupattaSet,
                onClick: () => handleRegularOptionClick(true, false),
                showBadge: false,
              },
              {
                key: "royal",
                title: "Royal Set",
                description: "Kurta + Dhoti + Dupatta with premium styling",
                price: getTierPrice("royal"),
                isSelected: isRoyalSet,
                onClick: handleRoyalSetClick,
                showBadge: true,
              },
              {
                key: "kurta-dupatta",
                title: "Kurta + Dupatta",
                description: "A graceful kurta-and-dupatta pairing",
                price: getTierPrice("kurta-dupatta"),
                isSelected: isDupattaSet && !isRoyalSet,
                onClick: () => handleRegularOptionClick(false, true),
                showBadge: false,
              },
            ].map((option) => {
              const isDisabled = option.key === "kurta-dhoti" && !kurtaDhotiEnabled;
              const isRoyalDisabled = option.key === "royal" && (!royalSetEnabled || availableDhtois.length === 0);
              const isSelected = option.isSelected;
              const originalPartsTotal = option.key === "royal" ? getTierPrice("kurta") + 700 + 699 : null;
              const savings = option.key === "royal" ? Math.max(0, originalPartsTotal - option.price) : null;

              return (
                <button
                  key={option.key}
                  onClick={() => {
                    if (isDisabled || isRoyalDisabled) return;
                    option.onClick();
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                    isSelected
                      ? "border-[#1D9E75] bg-emerald-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${isDisabled || isRoyalDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {option.showBadge && (
                        <div className="mb-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          Most popular
                        </div>
                      )}
                      <div className="text-sm font-semibold text-gray-900">{option.title}</div>
                      <div className="mt-1 text-xs text-gray-500">{option.description}</div>
                      {option.key === "royal" && (
                        <div className="mt-2 text-[11px] font-medium text-[#1D9E75]">
                          Premium bundle pricing
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {option.key === "royal" && (
                        <div className="text-[11px] text-gray-400 line-through">₹{originalPartsTotal}</div>
                      )}
                      <div className="text-sm font-semibold text-gray-900">₹{option.price}</div>
                      {option.key === "royal" && (
                        <div className="mt-1 text-[11px] font-medium text-emerald-600">Save ₹{savings}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {availableDhtois.length === 0 && product.isRoyal && royalSetEnabled && (
            <div className="mt-2 text-xs text-orange-600">
              Royal Set not available for size {selectedSize}
            </div>
          )}

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

          {showRoyalDescription && isRoyalSet && (
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg animate-fadeIn">
              <div className="flex items-start gap-2">
                <span className="text-lg text-gray-400">✨</span>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Royal Experience for Your Pet
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Comes with Kurta, Dhoti, Tassels, Dupatta and a Free gift.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {product?.dhotis?.length > 0 && renderDhotiOptions()}

      {/* Dhoti Unavailable Modal */}
      <AnimatePresence>
        {showDhotiUnavailableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDhotiUnavailableModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowDhotiUnavailableModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Dhoti and Royal Set options are currently being crafted with
                    love. They'll be available soon for your furry friend!
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center text-gray-700 text-sm">
                    <Gift className="w-4 h-4 mr-2 text-gray-500" />
                    Stay tuned for exclusive launch offers
                  </div>
                </div>

                <button
                  onClick={() => setShowDhotiUnavailableModal(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-medium"
                >
                  Got it, Thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductOptions;
