import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";

export default function FilterDrawer({
  open,
  onClose,
  category,
  filters,
  setFilters,
}) {
  // Define which filters show per category
  const filterConfig = {
    kurta: [
      "sort",
      "category",
      "price",
      "size",
      "style",
      "availability",
      "customColor",
    ],
    bow: ["sort", "price", "size", "availability"],
    lehnga: ["sort", "price", "size", "style", "availability"],
    tuxedo: ["sort", "price", "size", "style", "availability"],
  };

  const activeFilters = filterConfig[category] || [];

  // Handlers
  const handleCheckbox = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const handleRange = (key, e) =>
    setFilters((f) => ({ ...f, [key]: Number(e.target.value) }));

  // Count active filters
  const activeFilterCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (key === "sizes" && value.length > 0) return count + 1;
      if (key === "categories" && value.length > 0) return count + 1;
      if (key === "styleBeaded" && value) return count + 1;
      if (key === "styleSimple" && value) return count + 1;
      if (key === "inStockOnly" && value) return count + 1;
      if (key === "customColor" && value) return count + 1;
      if (key === "maxPrice" && value < filters.priceLimit) return count + 1;
      return count;
    },
    0
  );

  // Helper function to format category names
  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed inset-y-0 left-0 w-full sm:w-96 max-w-full bg-white shadow-xl z-50 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activeFilterCount} filter
                    {activeFilterCount !== 1 ? "s" : ""} applied
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 space-y-7">
                {/* 1) Sort */}
                {activeFilters.includes("sort") && (
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Sort By
                    </h3>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      {[
                        { value: "popularity", label: "Popularity" },
                        { value: "price-asc", label: "Price: Low to High" },
                        { value: "price-desc", label: "Price: High to Low" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleCheckbox("sortBy", option.value)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            filters.sortBy === option.value ? "bg-gray-100" : ""
                          }`}
                        >
                          <span className="text-gray-700">{option.label}</span>
                          {filters.sortBy === option.value && (
                            <Check size={18} className="text-gray-800" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2) Category */}
                {activeFilters.includes("category") && (
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Category
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {filters.categoryOptions.map((cat) => (
                        <button
                          key={cat}
                          onClick={() =>
                            setFilters((f) => ({
                              ...f,
                              categories: f.categories.includes(cat)
                                ? f.categories.filter((c) => c !== cat)
                                : [...f.categories, cat],
                            }))
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filters.categories.includes(cat)
                              ? "bg-gray-800 text-white shadow-sm"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {formatCategoryName(cat)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3) Price Range */}
                {activeFilters.includes("price") && (
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Price Range
                      </h3>
                      <span className="font-medium text-gray-800">
                        ₹{filters.maxPrice}
                      </span>
                    </div>

                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max={filters.priceLimit}
                        step="50"
                        value={filters.maxPrice}
                        onChange={(e) => handleRange("maxPrice", e)}
                        className="w-full accent-gray-800"
                      />

                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>₹0</span>
                        <span>₹{filters.priceLimit}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4) Size */}
                {activeFilters.includes("size") && (
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Sizes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {filters.sizeOptions.map((sz) => (
                        <button
                          key={sz}
                          onClick={() =>
                            setFilters((f) => ({
                              ...f,
                              sizes: f.sizes.includes(sz)
                                ? f.sizes.filter((s) => s !== sz)
                                : [...f.sizes, sz],
                            }))
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filters.sizes.includes(sz)
                              ? "bg-gray-800 text-white shadow-sm"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5) Style (beaded/simple) - FIXED */}
                {activeFilters.includes("style") && (
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Style
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: "styleBeaded", label: "Hand Work" },
                        { key: "styleSimple", label: "Simple" },
                      ].map((option) => (
                        <label
                          key={option.key}
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() =>
                            handleCheckbox(option.key, !filters[option.key])
                          }
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border ${
                              filters[option.key]
                                ? "bg-gray-800 border-gray-800"
                                : "border-gray-300"
                            }`}
                          >
                            {filters[option.key] && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6) Availability */}
                {activeFilters.includes("availability") && (
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Availability
                    </h3>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          filters.inStockOnly
                            ? "bg-gray-800 border-gray-800"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          handleCheckbox("inStockOnly", !filters.inStockOnly)
                        }
                      >
                        {filters.inStockOnly && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                      <span className="text-gray-700">In Stock Only</span>
                    </label>
                  </div>
                )}

                {/* 7) Custom Color */}
                {activeFilters.includes("customColor") && (
                  <div className="pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Custom Color
                    </h3>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          filters.customColor
                            ? "bg-gray-800 border-gray-800"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          handleCheckbox("customColor", !filters.customColor)
                        }
                      >
                        {filters.customColor && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                      <span className="text-gray-700">
                        Has Custom Color Option
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-white shadow-md">
              <button
                onClick={() =>
                  setFilters({
                    sortBy: "popularity",
                    maxPrice: filters.priceLimit,
                    sizes: [],
                    categories: [],
                    styleBeaded: false,
                    styleSimple: false,
                    inStockOnly: false,
                    customColor: false,
                    priceLimit: filters.priceLimit,
                    sizeOptions: filters.sizeOptions,
                    categoryOptions: filters.categoryOptions,
                  })
                }
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors shadow-sm"
              >
                <span>Apply</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
