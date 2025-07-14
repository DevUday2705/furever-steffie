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
  selectedSize = "XL",
  calculatePrice,
  navigate,
  addToCart,
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

  const handleBuyNow = () => {
    const orderDetails = {
      productId: product.id,
      name: product.name,
      subcategory: product.subcategory,
      isBeaded,
      isFullSet,
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
    const businessWhatsAppNumber = "+918828145667"; // Replace with your actual business WhatsApp number

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
        disabled={requiresMeasurements ? !measurementsValid : !selectedSize}
        className={`w-full py-3 ${
          requiresMeasurements
            ? !measurementsValid
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-gray-800 text-white"
            : !selectedSize
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-gray-800 text-white"
        } font-medium rounded-md`}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyNow}
      >
        Buy Now • {convertCurrency(calculatePrice(), currency)}
      </motion.button>

      <motion.button
        disabled={requiresMeasurements ? !measurementsValid : !selectedSize}
        className={`w-full py-3 mt-2 font-medium rounded-md border ${
          requiresMeasurements
            ? !measurementsValid
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "text-gray-800 border-gray-800"
            : !selectedSize
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
