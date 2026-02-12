import React, { useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { CurrencyContext } from "../../context/currencyContext";
import { convertCurrency } from "../../constants/currency";
import { useOrderPause } from "../../context/OrderPauseContext";
import { useAppContext } from "../../context/AppContext";

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
  selectedStyle, // NEW: for tassels tracking
  measurementsValid,
  requiresMeasurements,
  selectedColor,
}) => {
  const { currency, setCurrency } = useContext(CurrencyContext);
  const { ordersArePaused } = useOrderPause();
  const { cart, checkAndShowNotificationRequest } = useAppContext();

  // Check if current product configuration is already in cart
  const isProductInCart = () => {
    return cart.some(
      (item) =>
        item.productId === product.id &&
        item.isBeaded === isBeaded &&
        item.isFullSet === isFullSet &&
        item.isDupattaSet === isDupattaSet &&
        item.isRoyalSet === isRoyalSet &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor &&
        item.selectedDhoti === selectedDhoti &&
        item.selectedStyle === selectedStyle
    );
  };

  const productInCart = isProductInCart();

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
    if (["XS", "S", "M"].includes(selectedSize)) {
      return product?.sizeStock?.[selectedSize] > 0;
    }
    return true; // L, XL, XXL+ are always available
  };

  // Determine if actions should be enabled
  const shouldEnableActions = () => {
    // If orders are paused, disable all actions
    if (ordersArePaused) return false;

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
    // Find selected dhoti details if dhoti is selected
    const selectedDhotiDetails =
      selectedDhoti && product.dhotis
        ? product.dhotis.find((dhoti) => dhoti.id === selectedDhoti)
        : null;

    const orderDetails = {
      productId: product.id,
      name: product.name,
      category: product.category || product.type, // Use category from your JSON structure
      subcategory: product.subcategory, // Keep for backward compatibility
      isBeaded,
      isRoyalSet,
      isFullSet,
      isDupattaSet, // NEW
      selectedDhoti,
      selectedDhotiDetails, // Store basic dhoti info
      selectedStyle, // NEW: Track tassels selection
      selectedSize,
      selectedColor,
      price: calculatePrice(),
      image: images[0],
      measurements: requiresMeasurements ? measurements : null,
    };
    navigate("/checkout", { state: { orderDetails, sizeConfirmed: true } });
  };

  const handleAddToCart = () => {
    // If product is already in cart, open cart instead of adding
    if (productInCart) {
      setIsOpen(true);
      return;
    }

    // Find selected dhoti details if dhoti is selected
    const selectedDhotiDetails =
      selectedDhoti && product.dhotis
        ? product.dhotis.find((dhoti) => dhoti.id === selectedDhoti)
        : null;

    const cartItem = {
      productId: product.id,
      name: product.name,
      category: product.category || product.type, // Use category from your JSON structure
      subcategory: product.subcategory, // Keep for backward compatibility
      isBeaded,
      isFullSet,
      isDupattaSet, // NEW
      isRoyalSet,
      selectedDhoti,
      selectedDhotiDetails, // Store basic dhoti info for display
      selectedStyle, // NEW: Track tassels selection
      selectedSize,
      selectedColor,
      price: calculatePrice(),
      image: images[0],
      quantity: 1,
      measurements: requiresMeasurements ? measurements : null,
      addedAt: Date.now(),
    };

    addToCart(cartItem);
    toast.success("🐕 Product has been added to cart! Your furry friend's style is secured.", {
      duration: 4000,
      position: 'top-center',
    });
    
    // Check if we should show notification permission request
    checkAndShowNotificationRequest();
    
    // setIsOpen(true);

    // Schedule browser notification for abandoned cart (15 minutes)
    setTimeout(() => {
      scheduleAbandonedCartNotification();
    }, 2 * 60 * 1000); // 15 minutes
  };

  const scheduleAbandonedCartNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const cartItems = JSON.parse(localStorage.getItem('furever_cart') || '[]');
      if (cartItems.length > 0) {
        // Check if any items haven't been ordered yet
        const hasUnorderedItems = cartItems.some(item => !item.ordered);
        if (hasUnorderedItems) {
          new Notification('🐾 Your Furry Friend is Waiting!', {
            body: 'That perfect outfit is still in your cart - your pup\'s style moment awaits!',
            icon: '/images/thumbnail.avif',
            tag: 'abandoned-cart'
          });
        }
      }
    } else if ('Notification' in window) {
      // Request permission for future notifications
      Notification.requestPermission();
    }
  };

  const handleWhatsAppChat = () => {
    const businessWhatsAppNumber = "+917042212942";

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
  // if (isCustomSize) {
  //   return (
  //     <div className=" max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
  //       <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
  //         <p className="text-sm text-amber-800 font-medium">
  //           🐕 Custom Tailoring Required
  //         </p>
  //         <p className="text-xs text-amber-700 mt-1">
  //           For {selectedSize} size, we provide custom fitting to ensure perfect
  //           comfort for your dog
  //         </p>
  //       </div>

  //       <motion.button
  //         className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
  //         whileTap={{ scale: 0.98 }}
  //         onClick={handleWhatsAppChat}
  //       >
  //         <MessageCircle className="w-5 h-5" />
  //         Chat with Us for Custom Fitting
  //       </motion.button>

  //       <div className="text-center mt-2">
  //         <p className="text-xs text-gray-600">
  //           Get personalized assistance for the perfect fit
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // Regular flow for standard sizes
  return (
    <div className=" max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
      <motion.button
        disabled={!isActionsEnabled}
        className={`w-full py-3 font-medium rounded-md ${
          !isActionsEnabled
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : productInCart
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-800 text-white hover:bg-gray-900"
        } transition-colors duration-200`}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <ShoppingBag size={20}/>
          {ordersArePaused
            ? "Orders Temporarily Paused"
            : productInCart
            ? "Go to Cart"
            : "Add to Cart"}
        </span>
      </motion.button>
    </div>
  );
};

export default BottomActions;
