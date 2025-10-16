import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Crown,
  Circle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SmartStockFilter = ({ filters, setFilters, onSizeGuideOpen }) => {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Style options with icons
  const styleOptions = [
    {
      id: "traditional",
      label: "Traditional",
      icon: Circle,
      description: "Classic designs with elegant patterns",
    },
    {
      id: "modern",
      label: "Modern",
      icon: Sparkles,
      description: "Contemporary styles with sleek aesthetics",
    },
    {
      id: "beaded",
      label: "Beaded",
      icon: Crown,
      description: "Luxurious beaded decorations",
    },
  ];

  // Size options with descriptions
  const sizeOptions = [
    { size: "XS", chest: '16-18"', description: "Extra Small" },
    { size: "S", chest: '18-20"', description: "Small" },
    { size: "M", chest: '20-22"', description: "Medium" },
    { size: "L", chest: '22-24"', description: "Large" },
    { size: "XL", chest: '24-26"', description: "Extra Large" },
    { size: "2XL", chest: '26-28"', description: "2X Large" },
  ];

  // Handle style selection
  const toggleStyle = (styleId) => {
    const currentStyles = filters.smartStock?.styles || [];
    const newStyles = currentStyles.includes(styleId)
      ? currentStyles.filter((s) => s !== styleId)
      : [...currentStyles, styleId];

    setFilters((prev) => ({
      ...prev,
      smartStock: {
        ...prev.smartStock,
        styles: newStyles,
        enabled: newStyles.length > 0 || prev.smartStock?.sizes?.length > 0,
      },
    }));
  };

  // Handle size selection
  const toggleSize = (size) => {
    const currentSizes = filters.smartStock?.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    setFilters((prev) => ({
      ...prev,
      smartStock: {
        ...prev.smartStock,
        sizes: newSizes,
        enabled: newSizes.length > 0 || prev.smartStock?.styles?.length > 0,
      },
    }));
  };

  // Clear all selections
  const clearAll = () => {
    setFilters((prev) => ({
      ...prev,
      smartStock: {
        styles: [],
        sizes: [],
        enabled: false,
      },
    }));
  };

  const selectedStyles = filters.smartStock?.styles || [];
  const selectedSizes = filters.smartStock?.sizes || [];
  const hasSelections = selectedStyles.length > 0 || selectedSizes.length > 0;

  return (
    <div className="border-b border-gray-100 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Find My Size
          </h3>
          <div className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full font-medium">
            Smart
          </div>
        </div>
        {hasSelections && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-4">
        Select your preferred style and size to see only available products
      </p>

      {/* Style Selection */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gray-700">
            Style Preference
          </span>
          <Info size={12} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {styleOptions.map((style) => {
            const Icon = style.icon;
            const isSelected = selectedStyles.includes(style.id);

            return (
              <motion.button
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon size={16} />
                  <span className="text-xs font-medium">{style.label}</span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700">
              Size Required
            </span>
            <Info size={12} className="text-gray-400" />
          </div>
          <button
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition-colors"
          >
            Size Guide
            {showSizeGuide ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>
        </div>

        {/* Size Guide Dropdown */}
        <AnimatePresence>
          {showSizeGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 rounded-lg p-3 mb-3 overflow-hidden"
            >
              <div className="text-xs text-gray-600 mb-2 font-medium">
                Pet Chest Measurements
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {sizeOptions.map((option) => (
                  <div key={option.size} className="flex justify-between">
                    <span className="font-medium">{option.size}:</span>
                    <span className="text-gray-600">{option.chest}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => onSizeGuideOpen && onSizeGuideOpen()}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition-colors"
                >
                  View Complete Size Chart
                  <ExternalLink size={10} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size Grid */}
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((option) => {
            const isSelected = selectedSizes.includes(option.size);

            return (
              <motion.button
                key={option.size}
                onClick={() => toggleSize(option.size)}
                className={`
                  relative p-2.5 rounded-lg border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold">{option.size}</div>
                  <div className="text-xs text-gray-500">{option.chest}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={10} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Results Preview */}
      {hasSelections && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 border border-rose-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-rose-500" />
            <span className="text-xs font-medium text-rose-700">
              Smart Filter Active
            </span>
          </div>
          <div className="text-xs text-rose-600">
            Showing products available in{" "}
            {selectedStyles.length > 0 && (
              <span className="font-medium">
                {selectedStyles.join(", ")} style
                {selectedStyles.length > 1 ? "s" : ""}
              </span>
            )}
            {selectedStyles.length > 0 && selectedSizes.length > 0 && " and "}
            {selectedSizes.length > 0 && (
              <span className="font-medium">
                size{selectedSizes.length > 1 ? "s" : ""}{" "}
                {selectedSizes.join(", ")}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartStockFilter;
