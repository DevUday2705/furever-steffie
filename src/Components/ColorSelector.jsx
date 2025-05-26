import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ColorSelector = ({ colors, selectedColor, onColorSelect }) => {
  if (!colors || colors.length <= 1) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-900 mb-3">
        Available Colors
      </h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <motion.div
            key={color.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorSelect(color.id)}
            className="cursor-pointer group"
          >
            <div className="flex flex-col items-center gap-2">
              {/* Color Swatch */}
              <div
                className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color.id
                    ? "border-gray-800 shadow-lg"
                    : "border-gray-300 group-hover:border-gray-500"
                }`}
                style={{ backgroundColor: color.colorCode }}
              >
                {/* Check mark for selected color */}
                {selectedColor === color.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-white rounded-full p-1">
                      <Check className="w-3 h-3 text-gray-800" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Color Name */}
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  selectedColor === color.id
                    ? "text-gray-900"
                    : "text-gray-600 group-hover:text-gray-800"
                }`}
              >
                {color.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
