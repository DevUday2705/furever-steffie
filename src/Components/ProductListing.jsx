// components/ProductListing.jsx
import { useState, useEffect, useMemo, useContext } from "react";
import { motion } from "framer-motion";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import FilterDrawer from "./FilterDrawer";
import NotifyMeModal from "./NotifyMeModal";
import SizeStockSlider from "./SizeStockSlider";
import { useProductFilter } from "../hooks/useProductFilter";
import {
  ChevronLeft,
  Sliders,
  ArrowUpDown,
  AlertCircle,
  Flame,
  CrownIcon,
  Star,
  Check,
  Gem,
  DollarSign,
  Percent,
  Bell,
} from "lucide-react";
import PropTypes from "prop-types";
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
  const [quickFilters, setQuickFilters] = useState([]);
  const [notifyMeModal, setNotifyMeModal] = useState({
    isOpen: false,
    product: null,
  });
  const [sizeStockSlider, setSizeStockSlider] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [filters, setFilters] = useState({
    sortBy: "",
    maxPrice: 2000,
    priceLimit: 2000,
    sizes: [],
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
    styleBeaded: false,
    styleSimple: false,
    inStockOnly: false,
    smartStock: { styles: [], sizes: [], enabled: false },
    customColor: false,
    categories: ["all", "royal"],
    categoryOptions: ["all", "royal"],
  });

  // Helper function to check product stock status
  const getProductStockStatus = (product) => {
    // Check XS, S, M stock
    const managedSizes = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL"];
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
    if (filters.smartStock?.enabled) {
      if (filters.smartStock.styles.length > 0) {
        query.set("smartStyles", filters.smartStock.styles.join(","));
      }
      if (filters.smartStock.sizes.length > 0) {
        query.set("smartSizes", filters.smartStock.sizes.join(","));
      }
    }
    if (filters.customColor) query.set("custom", "1");

    if (filters.maxPrice !== filters.priceLimit)
      query.set("price", filters.maxPrice.toString());

    // ✅ Final fixed navigation
    navigate(`${location.pathname}?${query.toString()}`, { replace: true });
  }, [filters, navigate, location.pathname, searchParams]);

  const { currency, rate } = useContext(CurrencyContext);

  // Function to check if the file is a video
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    const urlPath = url.toLowerCase();
    return videoExtensions.some(ext => urlPath.includes(ext));
  };

  // Define quick filters with classy gray theme
  const quickFilterOptions = useMemo(
    () => [
      {
        id: "in-stock",
        label: "In Stock",
        icon: Check,
        isSpecial: true, // This will open the size slider
        filterFn: (product) => {
          // If no sizes selected, show all products with any stock
          if (selectedSizes.length === 0) {
            const sizeStock = product.sizeStock || {};
            return Object.values(sizeStock).some((stock) => (stock || 0) > 0);
          }
          // If sizes selected, show products with those specific sizes in stock
          return selectedSizes.some(
            (size) => (product.sizeStock?.[size] || 0) > 0
          );
        },
      },
      {
        id: "royal",
        label: "Royal",
        icon: CrownIcon,
        filterFn: (product) => product.isRoyal === true,
      },
      {
        id: "trending",
        label: "Trending",
        icon: Flame,
        filterFn: (product) => product.isTrending === true,
      },
      {
        id: "top-rated",
        label: "Top Rated",
        icon: Star,
        filterFn: (product) => (product.priorityScore || 0) >= 80,
      },
      {
        id: "beaded",
        label: "Beaded",
        icon: Gem,
        filterFn: (product) => product.isBeadedAvailable === true,
      },
      {
        id: "budget",
        label: "< ₹1000",
        icon: DollarSign,
        filterFn: (product) => (product.pricing?.basePrice || 0) < 1000,
      },
      {
        id: "discount",
        label: "40%+ Off",
        icon: Percent,
        filterFn: (product) => (product.pricing?.discountPercent || 0) >= 40,
      },
    ],
    [selectedSizes]
  );

  // Quick filter toggle handler
  const toggleQuickFilter = (filterId) => {
    // Handle special "in-stock" filter
    if (filterId === "in-stock") {
      setSizeStockSlider(true);
      return;
    }

    setQuickFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Size toggle handler for the slider
  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) => {
      const newSizes = prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size];

      // Auto-activate in-stock filter when sizes are selected
      if (newSizes.length > 0 && !quickFilters.includes("in-stock")) {
        setQuickFilters((current) => [...current, "in-stock"]);
      } else if (newSizes.length === 0 && quickFilters.includes("in-stock")) {
        setQuickFilters((current) => current.filter((id) => id !== "in-stock"));
      }

      return newSizes;
    });
  };

  const baseList = useMemo(() => [...products], [products]);

  // Apply regular filters first
  const regularFiltered = useProductFilter(baseList, filters, searchQuery);

  // Then apply quick filters
  const filtered = useMemo(() => {
    if (quickFilters.length === 0) {
      return regularFiltered;
    }

    const activeQuickFilters = quickFilterOptions.filter((filter) =>
      quickFilters.includes(filter.id)
    );

    return regularFiltered.filter((product) =>
      activeQuickFilters.every((filter) => filter.filterFn(product))
    );
  }, [regularFiltered, quickFilters, quickFilterOptions]);
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
  }, [searchParams]);
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
        {bannerImage && isVideo(bannerImage) ? (
          <video
            src={bannerImage}
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-md h-full object-cover"
          />
        ) : (
          <img
            src={bannerImage}
            alt="Kurta Banner"
            className="w-full rounded-md h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-md flex items-end justify-center">
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

      {/* Quick Filters */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          {/* Show selected sizes info */}
          {selectedSizes.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Filtering by sizes:</span>
              <div className="flex gap-1">
                {selectedSizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedSizes([]);
                  setQuickFilters((prev) =>
                    prev.filter((id) => id !== "in-stock")
                  );
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-2"
              >
                Clear sizes
              </button>
            </div>
          )}

          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Regular Quick Filters */}
            {quickFilterOptions.map((filter) => {
              const Icon = filter.icon;
              const isActive = quickFilters.includes(filter.id);
              const isInStockWithSizes =
                filter.id === "in-stock" && selectedSizes.length > 0;

              return (
                <button
                  key={filter.id}
                  onClick={() => toggleQuickFilter(filter.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 
                    whitespace-nowrap text-sm font-medium min-w-max
                    ${
                      isActive
                        ? isInStockWithSizes
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-gray-800 text-white border-gray-800 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {filter.label}
                  {isInStockWithSizes && (
                    <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-medium ml-1">
                      {selectedSizes.length}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Clear Button */}
            {quickFilters.length > 0 && (
              <button
                onClick={() => {
                  setQuickFilters([]);
                  setSelectedSizes([]);
                }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
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
            console.log(product.category);
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
                    {product.mainImage && isVideo(product.mainImage) ? (
                      <motion.video
                        src={product.mainImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                      />
                    ) : (
                      <motion.img
                        src={product.mainImage}
                        alt={product.name}
                        className="absolute w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                      />
                    )}

                    {/* Stock Status Indicators */}
                    {stockStatus.soldOut && product.category !== "tut" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-gray-900/20 flex flex-col items-center justify-center gap-3">
                        <div className="text-white px-4 py-2 rounded-lg font-semibold text-xl text-center">
                          SOLD <br /> OUT
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNotifyMeModal({ isOpen: true, product });
                          }}
                          className="bg-white text-gray-800 px-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-md"
                        >
                          <Bell className="w-4 h-4" />
                          Notify Me
                        </button>
                      </div>
                    )}

                    {stockStatus.soldOut && product.category == "tut" && (
                      <div
                        style={{
                          background:
                            "linear-gradient(90deg, #c9a94e, #b5892e)",
                          boxShadow: "0 2px 6px rgba(201, 169, 78, 0.35)",
                        }}
                        className="absolute overflow-hidden top-0 left-0 px-2 py-1 text-white text-xs rounded-br-lg"
                      >
                        <Flame size={10} className="inline-block mr-1" />
                        Coming Soon
                        <motion.div
                          className="absolute left-[-30%] top-0 w-[60%] h-full bg-white opacity-10 rotate-60"
                          animate={{ left: "130%" }}
                          transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
                      </div>
                    )}

                    {/* {!stockStatus.soldOut && stockStatus.lowStock && (
                      <div className="absolute top-0 left-0">
                        <div className="bg-amber-500 text-white px-2 py-1 rounded-br-sm  text-xs font-semibold shadow-md">
                          <div className="flex items-center gap-1">
                            Few Left!
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Trending Label */}
                    {product.isTrending && (
                      <div
                        style={{
                          background: "#63B8B7",
                        }}
                        className="absolute overflow-hidden top-0 right-0 px-2 py-1 text-white text-xs rounded-bl-lg"
                      >
                        <Flame size={10} className="inline-block mr-1" />
                        Trending
                        <motion.div
                          className="absolute left-[-30%] top-0 w-[60%] h-full bg-white opacity-10 rotate-60"
                          animate={{ left: "130%" }}
                          transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
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

      {/* NotifyMe Modal */}
      <NotifyMeModal
        isOpen={notifyMeModal.isOpen}
        onClose={() => setNotifyMeModal({ isOpen: false, product: null })}
        product={notifyMeModal.product}
      />

      {/* Size Stock Slider */}
      <SizeStockSlider
        isOpen={sizeStockSlider}
        onClose={() => setSizeStockSlider(false)}
        products={regularFiltered}
        selectedSizes={selectedSizes}
        onSizeToggle={handleSizeToggle}
        onClearSizes={() => {
          setSelectedSizes([]);
          setQuickFilters((prev) => prev.filter((id) => id !== "in-stock"));
        }}
      />
    </div>
  );
};

ProductListing.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  category: PropTypes.string.isRequired,
  bannerImage: PropTypes.string,
  bannerTitle: PropTypes.string,
  products: PropTypes.array.isRequired,
};

export default ProductListing;
