import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// NAVRATRI100 offer: ₹100 flat off, unlimited uses, valid 13–22 Oct 2026 (10 days)
export const NAVRATRI100_COUPON = "NAVRATRI100";
export const NAVRATRI100_EXPIRY = new Date("2026-10-22T23:59:59+05:30");
export const isNavratri100Active = () => new Date() <= NAVRATRI100_EXPIRY;

const BANNER_IMAGE =
  "https://ik.imagekit.io/cp9tee6jz/WhatsApp-Image-2026-10-12-at-2.51.22-PM.webp";
const AUTO_CLOSE_MS = 6000;

const NavratriBanner = () => {
  const [isVisible, setIsVisible] = useState(isNavratri100Active());

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setIsVisible(false), AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleClose = () => setIsVisible(false);

  return (
    <AnimatePresence>
      {isVisible && (
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
            className="relative rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center transition-all duration-200 shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={BANNER_IMAGE}
              alt="Navratri offer - use code NAVRATRI100 for ₹100 off"
              className="w-full h-auto object-contain"
              style={{ maxHeight: "85vh" }}
            />

            {/* Auto-close countdown */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: AUTO_CLOSE_MS / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-white/80"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavratriBanner;
