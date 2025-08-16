// components/ProductListing.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion } from "framer-motion";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import FilterDrawer from "./FilterDrawer";
import { useProductFilter } from "../hooks/useProductFilter";
import {
  ChevronLeft,
  Sliders,
  ArrowUpDown,
  AlertCircle,
  Flame,
  CrownIcon,
  ArrowRightCircle,
  ArrowRightFromLine,
  ArrowBigRightDash,
  ArrowDownAz,
  ShirtIcon,
  Star,
  StarsIcon,
} from "lucide-react";
import { CurrencyContext } from "../context/currencyContext";

const ProductListing = ({
  title,
  subtitle,
  category,
  bannerImage,
  bannerTitle,
  products,
}) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "",
    maxPrice: 2000,
    priceLimit: 2000,
    sizes: [],
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
    styleBeaded: false,
    styleSimple: false,
    inStockOnly: false,
    customColor: false,
    categories: ["all", "royal"],
    categoryOptions: ["all", "royal"],
  });

  // Helper function to check product stock status
  const getProductStockStatus = (product) => {
    // Check XS, S, M stock
    const managedSizes = ["XS", "S", "M"];
    const stockInfo = managedSizes.map((size) => ({
      size,
      stock: product?.sizeStock?.[size] || 0,
      inStock: (product?.sizeStock?.[size] || 0) > 0,
    }));

    const totalManagedStock = stockInfo.reduce(
      (sum, item) => sum + item.stock,
      0
    );
    const inStockSizes = stockInfo.filter((item) => item.inStock);

    return {
      stockInfo,
      totalManagedStock,
      hasAnyStock: inStockSizes.length > 0 || true, // L, XL, XXL always available
      lowStock: totalManagedStock > 0 && totalManagedStock <= 5,
      soldOut: totalManagedStock === 0,
    };
  };
  useEffect(() => {
    const query = new URLSearchParams();

    // 🔁 Preserve existing ?search param
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      query.set("search", currentSearch);
    }

    if (filters.sortBy === "price-asc") query.set("sort", "asc");
    else if (filters.sortBy === "price-desc") query.set("sort", "desc");
    else if (filters.sortBy === "popularity") query.set("sort", "popularity");

    if (filters.categories.length) query.set("type", filters.categories[0]);
    if (filters.sizes.length) query.set("sizes", filters.sizes.join(","));

    if (filters.styleBeaded) query.set("beaded", "1");
    if (filters.styleSimple) query.set("simple", "1");
    if (filters.inStockOnly) query.set("stock", "1");
    if (filters.customColor) query.set("custom", "1");

    if (filters.maxPrice !== filters.priceLimit)
      query.set("price", filters.maxPrice.toString());

    // ✅ Final fixed navigation
    navigate(`${location.pathname}?${query.toString()}`, { replace: true });
  }, [filters, navigate, location.pathname, searchParams]);

  const { currency, rate } = useContext(CurrencyContext);

  const baseList = useMemo(() => [...products], [products]);
  const filtered = useProductFilter(baseList, filters, searchQuery);
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

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  useEffect(() => {
    const getBoolean = (val) => val === "1";
    const getArray = (val) => (val ? val.split(",") : []);

    const updatedFilters = {
      sortBy:
        searchParams.get("sort") === "asc"
          ? "price-asc"
          : searchParams.get("sort") === "desc"
          ? "price-desc"
          : searchParams.get("sort") === "popularity"
          ? "popularity"
          : "",

      categories: searchParams.get("type") ? [searchParams.get("type")] : [],

      sizes: getArray(searchParams.get("sizes")),
      styleBeaded: getBoolean(searchParams.get("beaded")),
      styleSimple: getBoolean(searchParams.get("simple")),
      inStockOnly: getBoolean(searchParams.get("stock")),
      customColor: getBoolean(searchParams.get("custom")),
      maxPrice: Number(searchParams.get("price")) || 2000,

      // Keep static values intact
      priceLimit: 2000,
      sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
      categoryOptions: ["all", "royal"],
    };

    setFilters(updatedFilters);
  }, []);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  const currencySymbols = {
    INR: "₹",
    SGD: "S$",
    MYR: "RM",
    USD: "$",
    GBP: "£",
    NZD: "NZ$",
  };

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md flex items-end justify-center">
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
            const currentPrice = (price * rate).toFixed(2);
            const originalPriceConverted = (originalPrice * rate).toFixed(2);

            // Get stock status
            const stockStatus = getProductStockStatus(product);

            return (
              <motion.div
                key={product.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden ${
                  stockStatus.soldOut ? "opacity-60" : ""
                }`}
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

                    {/* Stock Status Indicators */}
                    {stockStatus.soldOut && (
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/40 flex items-center justify-center ">
                        <div className=" text-white px-4 py-2 rounded-lg font-semibold text-4xl text-center shadow-lg">
                          SOLD <br /> OUT
                        </div>
                      </div>
                    )}

                    {!stockStatus.soldOut && stockStatus.lowStock && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            Low Stock
                          </div>
                        </div>
                      </div>
                    )}
                    {/* {product.priorityScore >= 90 && (
                      <div className="absolute top-0 left-0">
                        <div className="flex items-center bg-amber-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">
                          <Flame size={10} className="text-white mr-0.5" />
                          <span className="font-medium text-[12px]">
                            Best Sellers
                          </span>
                        </div>
                      </div>
                    )} */}
                    {product.isRoyal && (
                      <div
                        style={{
                          background:
                            "linear-gradient(90deg, #c9a94e, #b5892e)",
                          boxShadow: "0 2px 6px rgba(201, 169, 78, 0.35)",
                        }}
                        className="absolute overflow-hidden bottom-0 left-0 px-2 py-0.5 text-white text-xs  rounded-tr-lg"
                      >
                        <CrownIcon size={10} className="inline-block mr-1" />
                        Royal
                        <motion.div
                          className="absolute left-[-30%] top-0 w-[60%] h-full bg-white opacity-10 rotate-60"
                          animate={{ left: "130%" }}
                          transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="text-sm  font-medium text-gray-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <div className="flex flex-col ">
                      <div className="flex items-baseline flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                          {currencySymbols[currency] || currency} {currentPrice}
                        </span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-xs mx-1 text-gray-400 line-through font-medium">
                              {currencySymbols[currency] || currency}
                              {originalPriceConverted}
                            </span>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className="inline-flex  items-center px-1 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200/50"
                            >
                              {discountPercent}% off
                            </motion.span>
                          </>
                        )}
                      </div>

                      {/* Stock Status Information */}
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
