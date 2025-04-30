import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { kurtas } from "../constants/constant";
import {
  ChevronLeft,
  AlertCircle,
  Sliders,
  ArrowUpDown,
  Flame,
} from "lucide-react";
import FilterDrawer from "./FilterDrawer";
import { useProductFilter } from "../hooks/useProductFilter";

const KurtaListing = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: "popularity",
    maxPrice: 2000,
    priceLimit: 2000,
    sizes: [],
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
    styleBeaded: false,
    styleSimple: false,
    inStockOnly: false,
    customColor: false,
    categories: [],
    categoryOptions: ["classic", "premium"],
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 1) Base list
  const baseList = useMemo(() => [...kurtas], []);
  const filtered = useProductFilter(baseList, filters);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === "sizes" && value.length > 0) return count + 1;
      if (key === "categories" && value.length > 0) return count + 1;
      if (key === "styleBeaded" && value) return count + 1;
      if (key === "styleSimple" && value) return count + 1;
      if (key === "inStockOnly" && value) return count + 1;
      if (key === "customColor" && value) return count + 1;
      if (key === "maxPrice" && value < filters.priceLimit) return count + 1;
      return count;
    }, 0);
  }, [filters]);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleGoBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  console.log("Selected Categories:", filters.categories);
  console.log(
    "Filtered Products:",
    filtered.map((p) => `${p.name} (${p.category})`)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category="kurta"
        filters={filters}
        setFilters={setFilters}
      />

      {/* Top Navigation + Filter Button */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="ml-1 text-sm font-medium">Back</span>
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors border border-gray-200 shadow-sm"
          >
            <Sliders size={16} />
            <span>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
            <ArrowUpDown size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">
            All Kurtas
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Explore our exclusive range of handcrafted kurtas for pets!
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((product) => {
            const basePrice = product.pricing.basePrice || 0;
            const beadedAdd = product.pricing.beadedAdditional || 0;
            const price = product.isBeadedAvailable
              ? basePrice + beadedAdd
              : basePrice;

            // Calculate discount (random between 5-15%)
            const discountPercent = Math.floor(Math.random() * 11) + 5; // 5-15%
            const originalPrice = Math.round(
              price * (100 / (100 - discountPercent))
            );

            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Link to={`/product/${product.id}+${product.type}`}>
                  <div className="relative pb-[125%] overflow-hidden">
                    <motion.img
                      src={product.mainImage}
                      alt={product.name}
                      className="absolute w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                    />

                    {/* Best Seller Badge */}
                    {product.priorityScore >= 90 && (
                      <div className="absolute top-3 left-3">
                        <motion.div
                          className="flex items-center gap-1 bg-gradient-to-r from-gray-800 to-gray-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Flame size={14} className="text-white" />
                          <span>Best Seller</span>
                        </motion.div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3">
                      <motion.div
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg ${
                          product.category === "premium"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {product.category === "premium" ? "Premium" : "Classic"}
                      </motion.div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3
                      className="text-sm font-medium text-gray-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    <div className="flex flex-col h-16">
                      {" "}
                      {/* Fixed height container */}
                      <div className="flex items-baseline flex-wrap">
                        <span className="text-base font-bold text-gray-800 mr-2">
                          ₹{price}
                        </span>
                        <span className="text-sm text-gray-500 line-through mr-2">
                          ₹{originalPrice}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                          {discountPercent}% off
                        </span>
                      </div>
                      {/* Few Left indicator as a separate element that doesn't affect layout */}
                      {product.availableStock <= 5 && (
                        <div className="mt-1">
                          <span className="text-xs font-medium text-red-500">
                            Only few left
                          </span>
                        </div>
                      )}
                      {/* Spacer to push view details to bottom */}
                      <div className="flex-grow"></div>
                      {/* View Details always at the bottom */}
                      <div className="flex justify-end mt-1">
                        <motion.div
                          className="text-gray-800 font-medium text-xs flex items-center"
                          whileHover={{ x: 4 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                        >
                          View Details
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 ml-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              No products match your current filter selections. Try adjusting
              your filters to find what you're looking for.
            </p>
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
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KurtaListing;
