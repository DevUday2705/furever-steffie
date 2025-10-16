import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Ruler, Package, Info } from "lucide-react";

const SizeStockSlider = ({
  isOpen,
  onClose,
  products,
  selectedSizes,
  onSizeToggle,
  onClearSizes,
}) => {
  const [showSizeGuide, setShowSizeGuide] = useState(true);

  // Calculate size availability from products
  const sizeData = React.useMemo(() => {
    const sizes = ["XS", "S", "M", "L", "XL", "2XL"];

    return sizes.map((size) => {
      const availableCount = products.filter((product) => {
        const sizeStock = product.sizeStock?.[size] || 0;
        return sizeStock > 0;
      }).length;

      return {
        size,
        count: availableCount,
        available: availableCount > 0,
      };
    });
  }, [products]);

  // Size guide data
  const sizeGuide = [
    { size: "XS", chest: '16-18"', neck: '10-12"', length: '8-10"' },
    { size: "S", chest: '18-20"', neck: '12-14"', length: '10-12"' },
    { size: "M", chest: '20-22"', neck: '14-16"', length: '12-14"' },
    { size: "L", chest: '22-24"', neck: '16-18"', length: '14-16"' },
    { size: "XL", chest: '24-26"', neck: '18-20"', length: '16-18"' },
    { size: "2XL", chest: '26-28"', neck: '20-22"', length: '18-20"' },
  ];

  const selectedCount = selectedSizes.length;
  const totalAvailableProducts =
    selectedSizes.length > 0
      ? products.filter((product) =>
          selectedSizes.some((size) => (product.sizeStock?.[size] || 0) > 0)
        ).length
      : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slider */}
          <motion.div
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-[70] max-h-[75vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Find Your Size
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select sizes to see available products
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(75vh-140px)]">
              {/* Size Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                    Available Sizes
                  </h4>
                  {selectedCount > 0 && (
                    <button
                      onClick={onClearSizes}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {sizeData.map(({ size, count, available }) => {
                    const isSelected = selectedSizes.includes(size);

                    return (
                      <motion.button
                        key={size}
                        onClick={() => available && onSizeToggle(size)}
                        disabled={!available}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all duration-200
                          ${
                            !available
                              ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                              : isSelected
                              ? "bg-rose-500 border-rose-500 text-white shadow-md"
                              : "bg-white border-gray-200 hover:border-rose-300 hover:bg-rose-50"
                          }
                        `}
                        whileHover={available ? { scale: 1.02 } : {}}
                        whileTap={available ? { scale: 0.98 } : {}}
                      >
                        <div className="text-center">
                          <div
                            className={`text-sm font-bold ${
                              !available
                                ? "text-gray-400"
                                : isSelected
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {size}
                          </div>
                          <div
                            className={`
                            text-xs mt-1 px-1.5 py-0.5 rounded-full font-medium
                            ${
                              !available
                                ? "bg-gray-200 text-gray-500"
                                : isSelected
                                ? "bg-white/20 text-white"
                                : "bg-rose-100 text-rose-700"
                            }
                          `}
                          >
                            {available ? `${count} items` : "Out"}
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Results Preview */}
                {selectedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 border border-rose-200"
                  >
                    <div className="flex items-center gap-2 text-rose-700">
                      <Check className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {totalAvailableProducts} products available in selected
                        size{selectedCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Size Guide Toggle */}
              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-3 hover:text-gray-900 transition-colors"
                >
                  <Ruler className="w-3 h-3" />
                  Size Guide
                  <Info className="w-3 h-3 text-gray-400" />
                </button>

                {/* Size Guide Table */}
                <AnimatePresence>
                  {showSizeGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-2 font-medium">
                          Pet Measurements Guide
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-1.5 font-semibold text-gray-700">
                                  Size
                                </th>
                                <th className="text-left py-1.5 font-semibold text-gray-700">
                                  Chest
                                </th>
                                <th className="text-left py-1.5 font-semibold text-gray-700">
                                  Neck
                                </th>
                                <th className="text-left py-1.5 font-semibold text-gray-700">
                                  Length
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {sizeGuide.map((row) => (
                                <tr
                                  key={row.size}
                                  className="border-b border-gray-100 last:border-0"
                                >
                                  <td className="py-1.5 font-medium text-gray-900">
                                    {row.size}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {row.chest}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {row.neck}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {row.length}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          💡 Measure your pet&apos;s chest at the widest point
                          for best fit
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  disabled={selectedCount === 0}
                  className="flex-1 py-2.5 px-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {selectedCount > 0
                    ? `Apply (${totalAvailableProducts})`
                    : "Select sizes"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SizeStockSlider;
