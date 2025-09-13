import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PopupPoster = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup has been shown recently (within 24 hours)
    const lastShown = localStorage.getItem("posterLastShown");
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;

    // if (!lastShown || now - parseInt(lastShown) > twoHours) {
    // Show popup after a short delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      localStorage.setItem("posterLastShown", now.toString());
    }, 2000);

    return () => clearTimeout(showTimer);
    // }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleBuyNow = () => {
    setIsVisible(false);
    navigate("/product/G604GyHMqL7s7RK10Ma6+kurta");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Poster Image */}
          <div className="relative">
            <img
              src="https://res.cloudinary.com/di6unrpjw/image/upload/v1757757237/Poster_2_xhtqai.jpg"
              alt="Special Offer"
              className="w-full h-auto object-cover"
              style={{ maxHeight: "500px" }}
            />

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>

          {/* CTA Button */}
          <div className="p-6 pb-4">
            <motion.button
              onClick={handleBuyNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-lg">Show me!</span>
            </motion.button>
          </div>

          {/* Progress Bar */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopupPoster;
