import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CurrencySelector = ({ currency, setCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { value: "INR", label: "🇮🇳 INR (₹)", flag: "🇮🇳" },
    { value: "SGD", label: "🇸🇬 SGD (S$)", flag: "🇸🇬" },
    { value: "MYR", label: "🇲🇾 MYR (RM)", flag: "🇲🇾" },
    { value: "USD", label: "🇺🇸 USD ($)", flag: "🇺🇸" },
    { value: "GBP", label: "🇬🇧 GBP (£)", flag: "🇬🇧" },
    { value: "NZD", label: "🇳🇿 NZD (NZ$)", flag: "🇳🇿" },
    { value: "CAD", label: "🇨🇦 CAD (C$)", flag: "🇨🇦" },
  ];

  const selectedCurrency = currencies.find((c) => c.value === currency);

  const handleSelect = (value) => {
    setCurrency(value);
    setIsOpen(false);
  };

  return (
    <div className="relative ml-5">
      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm space-x-3 mr-5 bg-white/70 hover:bg-white/90 border border-gray-200/50 hover:border-gray-300/50 rounded-xl px-2 py-1.5  transition-all duration-300 backdrop-blur-sm min-w-[50px]"
      >
        <span className="text-lg">{selectedCurrency.flag}</span>
        {/* <span className="font-medium text-gray-700 flex-1 text-left">
          {selectedCurrency.value}
        </span> */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute min-w-[140px] top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {currencies.map((curr, index) => (
              <motion.button
                key={curr.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                onClick={() => handleSelect(curr.value)}
                className={`w-full flex items-center text-sm space-x-3 px-4 py-3 text-left transition-colors duration-200 ${
                  currency === curr.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {/* <span className="text-lg">{curr.flag}</span> */}
                <span className="font-medium flex-1">{curr.label}</span>
                {currency === curr.value && (
                  <motion.div
                    layoutId="selected"
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default CurrencySelector;
