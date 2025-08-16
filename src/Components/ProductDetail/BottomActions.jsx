import React, { useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import { CurrencyContext } from "../../context/currencyContext";
import { convertCurrency } from "../../constants/currency";

const BottomActions = ({
  product,
  images,
  isBeaded,
  isFullSet,
  isDupattaSet, // NEW
  selectedSize = "XL",
  calculatePrice,
  navigate,
  addToCart,
  isRoyalSet,
  setIsOpen,
  measurements,
  selectedDhoti,
  measurementsValid,
  requiresMeasurements,
  selectedColor,
}) => {
  const { currency, setCurrency } = useContext(CurrencyContext);

  // Check if selected size requires custom tailoring
  const isCustomSize =
    selectedSize &&
    ["XL", "XXL", "XXXL", "2XL", "3XL", "4XL", "5XL"].includes(
      selectedSize.toUpperCase()
    );

  // Check if user has saved size (from localStorage)
  const hasSavedSize = !!localStorage.getItem("savedPetSize");

  // Check if selected size is in stock
  const isSizeInStock = () => {
    if (['XS', 'S', 'M'].includes(selectedSize)) {
      return product?.sizeStock?.[selectedSize] > 0;
    }
    return true; // L, XL, XXL+ are always available
  };

  // Determine if actions should be enabled
  const shouldEnableActions = () => {
    if (!selectedSize) return false;
    
    // Check stock for XS, S, M sizes
    if (!isSizeInStock()) return false;

    if (requiresMeasurements) {
      // If measurements are required, check if user has saved size OR valid measurements
      return hasSavedSize || measurementsValid;
    }

    // For products that don't require measurements, just check if size is selected
    return true;
  };

  const handleBuyNow = () => {
    const orderDetails = {
      productId: product.id,
      name: product.name,
      subcategory: product.subcategory,
      isBeaded,
      isRoyalSet,
      isFullSet,
      isDupattaSet, // NEW
      selectedDhoti,
      selectedSize,
      selectedColor,
      price: calculatePrice(),
      image: images[0],
      measurements: requiresMeasurements ? measurements : null,
    };
    navigate("/checkout", { state: { orderDetails, sizeConfirmed: true } });
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      subcategory: product.subcategory,
      isBeaded,
      isFullSet,
      isDupattaSet, // NEW
      isRoyalSet,
      selectedSize,
      selectedColor,
      price: calculatePrice(),
      image: images[0],
      quantity: 1,
      measurements: requiresMeasurements ? measurements : null,
    });
    toast.success("Added To Cart");
    setIsOpen(true);
  };

  const handleWhatsAppChat = () => {
    const businessWhatsAppNumber = "+918828145667";

    const message = `Hi, I need help with my dog's dress - 
Name: ${product.name}
Product ID: ${product.id}
Selected Size: ${selectedSize}
Can we talk?
Thanks`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${businessWhatsAppNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const isActionsEnabled = shouldEnableActions();

  // If custom size is selected, show WhatsApp button
  if (isCustomSize) {
    return (
      <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-amber-800 font-medium">
            🐕 Custom Tailoring Required
          </p>
          <p className="text-xs text-amber-700 mt-1">
            For {selectedSize} size, we provide custom fitting to ensure perfect
            comfort for your dog
          </p>
        </div>

        <motion.button
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
          whileTap={{ scale: 0.98 }}
          onClick={handleWhatsAppChat}
        >
          <MessageCircle className="w-5 h-5" />
          Chat with Us for Custom Fitting
        </motion.button>

        <div className="text-center mt-2">
          <p className="text-xs text-gray-600">
            Get personalized assistance for the perfect fit
          </p>
        </div>
      </div>
    );
  }

  // Regular flow for standard sizes
  return (
    <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
      <motion.button
        disabled={!isActionsEnabled}
        className={`w-full py-3 ${
          !isActionsEnabled
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-gray-800 text-white"
        } font-medium rounded-md`}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyNow}
      >
        Buy Now • {convertCurrency(calculatePrice(), currency)}
      </motion.button>

      <motion.button
        disabled={!isActionsEnabled}
        className={`w-full py-3 mt-2 font-medium rounded-md border ${
          !isActionsEnabled
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-gray-800 border-gray-800"
        }`}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
      >
        Add to Cart • {convertCurrency(calculatePrice(), currency)}
      </motion.button>
    </div>
  );
};

export default BottomActions;
