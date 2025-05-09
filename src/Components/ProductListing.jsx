// components/ProductListing.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FilterDrawer from "./FilterDrawer";
import { useProductFilter } from "../hooks/useProductFilter";
import {
  ChevronLeft,
  Sliders,
  ArrowUpDown,
  AlertCircle,
  Flame,
  CrownIcon,
} from "lucide-react";

const ProductListing = ({
  title,
  subtitle,
  category,
  bannerImage,
  bannerTitle,
  products,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    categories: ["all"],
    categoryOptions: ["all", "royal"],
  });

  const baseList = useMemo(() => [...products], [products]);
  const filtered = useProductFilter(baseList, filters);
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      const ignoredKeys = [
        "sortBy",
        "priceLimit",
        "sizeOptions",
        "categoryOptions",
      ];
      if (ignoredKeys.includes(key)) return count;

      if (Array.isArray(value) && value.length > 0) return count + 1;
      if (typeof value === "boolean" && value) return count + 1;
      if (key === "maxPrice" && value < filters.priceLimit) return count + 1;

      return count;
    }, 0);
  }, [filters]);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }
  console.log(category);
  return (
    <div className="bg-gray-50 min-h-screen">
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={category}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Top Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
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

      {/* Banner */}
      <div className="relative bg-white w-full h-[250px] md:h-[300px] overflow-hidden">
        <img
          src={bannerImage}
          alt="Kurta Banner"
          className="w-full rounded-md h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 rounded-md flex items-end justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-xl ml-5 mb-5  md:text-4xl font-bold tracking-wide drop-shadow-md"
          >
            {bannerTitle}
          </motion.h2>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">
            {title}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
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
            const discountPercent = product.pricing.discountPercent || 0;
            const originalPrice =
              discountPercent > 0
                ? Math.round(price * (100 / (100 - discountPercent)))
                : price;

            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -3 }}
              >
                <Link to={`/product/${product.id}+${product.type}`}>
                  <div className="relative pb-[125%] overflow-hidden">
                    <motion.img
                      src={product.mainImage}
                      alt={product.name}
                      className="absolute w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                    />
                    {product.priorityScore >= 90 && (
                      <div className="absolute top-0 left-0">
                        <div className="flex items-center bg-amber-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">
                          <Flame size={10} className="text-white mr-0.5" />
                          <span className="font-medium text-[12px]">Hot</span>
                        </div>
                      </div>
                    )}
                    {product.category === "royal" && (
                      <div className="absolute bottom-0 left-0 px-2 py-0.5 text-white text-xs bg-yellow-500 rounded-tr-lg">
                        <CrownIcon size={10} className="inline-block mr-1" />
                        Royal
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="text-sm font-medium text-gray-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <div className="flex flex-col h-16">
                      <div className="flex items-baseline flex-wrap">
                        <span className="text-base font-bold text-gray-800 mr-2">
                          ₹{price}
                        </span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-sm text-gray-500 line-through mr-2">
                              ₹{originalPrice}
                            </span>
                            <span className="text-xs font-medium text-emerald-600">
                              {discountPercent}% off
                            </span>
                          </>
                        )}
                      </div>
                      {product.availableStock <= 5 && (
                        <span className="text-xs font-medium text-red-500 mt-1">
                          Only few left
                        </span>
                      )}
                      <div className="flex-grow" />
                      <div className="flex justify-end mt-1 text-xs font-medium text-gray-800">
                        View Details →
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
            <AlertCircle size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              No products match your current filter selections. Try adjusting
              your filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  ...filters,
                  categories: [],
                  sizes: [],
                  styleBeaded: false,
                  styleSimple: false,
                  inStockOnly: false,
                  customColor: false,
                  maxPrice: filters.priceLimit,
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

export default ProductListing;
