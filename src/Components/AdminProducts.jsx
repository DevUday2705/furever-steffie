import { useState, useEffect, useMemo } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import {
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaCrown,
  FaStar,
  FaFire,
  FaGem,
  FaRupeeSign,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
const ADMIN_KEY = "What@270598";
const collections = [
  "kurtas",
  "frocks",
  "tuxedos",
  "tuts",
  "lehengas",
  "male-bandanas",
  "pathanis",
];

const isInStock = (product) => {
  const sizeStock = product.sizeStock || {};
  return (
    Object.values(sizeStock).some((stock) => stock > 0) ||
    product.availableStock > 0
  );
};

// Tile that can be dragged to a new position in reorder mode
/* eslint-disable react/prop-types */
const SortableTile = ({ item, rank }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "manipulation",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative select-none rounded-md overflow-hidden border bg-white cursor-grab ${
        isDragging
          ? "border-rose-400 shadow-xl scale-105 opacity-90"
          : "border-amber-200"
      }`}
    >
      <img
        src={item.mainImage}
        alt={item.name}
        draggable={false}
        className="w-full aspect-square object-cover pointer-events-none"
      />
      <span className="absolute top-0 left-0 bg-rose-600 text-white text-[9px] font-bold leading-none px-1 py-0.5 rounded-br">
        {rank}
      </span>
    </div>
  );
};

/* eslint-enable react/prop-types */

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get("category") || null
  );
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [reorderMode, setReorderMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );
  const [passkey, setPasskey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleLogin = () => {
    if (passkey === ADMIN_KEY) {
      setIsAuthorized(true);
    } else {
      alert("Wrong admin key!");
    }
  };

  // Helper function to handle collection selection
  const handleCollectionSelect = (collectionName) => {
    setSelectedCollection(collectionName);
    setReorderMode(false);
    setSearchParams({ category: collectionName });
  };

  // Helper function to go back to collection selection
  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setSearchParams({});
  };

  const fetchProducts = async (collectionName) => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Define quick filters
  const quickFilters = useMemo(
    () => [
      {
        id: "in-stock",
        label: "In Stock",
        icon: FaCheck,
        color: "bg-green-100 text-green-800 border-green-200",
        activeColor: "bg-green-500 text-white border-green-500",
        filterFn: isInStock,
      },
      {
        id: "low-stock",
        label: "Low Stock",
        icon: FaExclamationTriangle,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        activeColor: "bg-yellow-500 text-white border-yellow-500",
        filterFn: (product) => {
          const sizeStock = product.sizeStock || {};
          const totalStock = Object.values(sizeStock).reduce(
            (sum, stock) => sum + (stock || 0),
            0
          );
          return totalStock > 0 && totalStock <= 5;
        },
      },
      {
        id: "out-of-stock",
        label: "Out of Stock",
        icon: FaTimes,
        color: "bg-red-100 text-red-800 border-red-200",
        activeColor: "bg-red-500 text-white border-red-500",
        filterFn: (product) => {
          const sizeStock = product.sizeStock || {};
          const totalStock = Object.values(sizeStock).reduce(
            (sum, stock) => sum + (stock || 0),
            0
          );
          return (
            totalStock === 0 &&
            (!product.availableStock || product.availableStock === 0)
          );
        },
      },
      {
        id: "royal",
        label: "Royal",
        icon: FaCrown,
        color: "bg-purple-100 text-purple-800 border-purple-200",
        activeColor: "bg-purple-500 text-white border-purple-500",
        filterFn: (product) => product.isRoyal === true,
      },
      {
        id: "trending",
        label: "Trending",
        icon: FaFire,
        color: "bg-orange-100 text-orange-800 border-orange-200",
        activeColor: "bg-orange-500 text-white border-orange-500",
        filterFn: (product) => product.isTrending === true,
      },
      {
        id: "top-rated",
        label: "Top Rated",
        icon: FaStar,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        activeColor: "bg-blue-500 text-white border-blue-500",
        filterFn: (product) => (product.priorityScore || 0) >= 80,
      },
      {
        id: "beaded",
        label: "Beaded",
        icon: FaGem,
        color: "bg-pink-100 text-pink-800 border-pink-200",
        activeColor: "bg-pink-500 text-white border-pink-500",
        filterFn: (product) => product.isBeadedAvailable === true,
      },
      {
        id: "budget",
        label: "< ₹1000",
        icon: FaRupeeSign,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        activeColor: "bg-gray-500 text-white border-gray-500",
        filterFn: (product) => (product.pricing?.basePrice || 0) < 1000,
      },
      {
        id: "premium",
        label: "₹1000-2000",
        icon: FaGem,
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        activeColor: "bg-indigo-500 text-white border-indigo-500",
        filterFn: (product) => {
          const price = product.pricing?.basePrice || 0;
          return price >= 1000 && price <= 2000;
        },
      },
      {
        id: "luxury",
        label: "> ₹2000",
        icon: FaCrown,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        activeColor: "bg-yellow-500 text-white border-yellow-500",
        filterFn: (product) => (product.pricing?.basePrice || 0) > 2000,
      },
    ],
    []
  );

  // Filter toggle handler
  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Sizes that are down to their last piece
  const getLastPieceSizes = (product) => {
    const sizeStock = product.sizeStock || {};
    return Object.entries(sizeStock)
      .filter(([, stock]) => Number(stock) === 1)
      .map(([size]) => size);
  };

  // Helper function to calculate total items from sizeStock
  const calculateTotalItems = (products) => {
    return products.reduce((total, product) => {
      const sizeStock = product.sizeStock || {};
      const productTotal = Object.values(sizeStock).reduce(
        (sum, stock) => sum + (stock || 0),
        0
      );
      // If no sizeStock, fall back to availableStock
      const fallbackStock = productTotal > 0 ? productTotal : (product.availableStock || 0);
      return total + fallbackStock;
    }, 0);
  };

  // Calculate total items for current filtered products
  const totalItems = useMemo(() => calculateTotalItems(filteredProducts), [filteredProducts]);
  const totalAllItems = useMemo(() => calculateTotalItems(products), [products]);

  // Apply filters and search to products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quick filters
    if (activeFilters.length > 0) {
      const activeFilterObjects = quickFilters.filter((filter) =>
        activeFilters.includes(filter.id)
      );

      filtered = filtered.filter((product) =>
        activeFilterObjects.some((filter) => filter.filterFn(product))
      );
    }

    setFilteredProducts(filtered);
  }, [products, activeFilters, searchQuery, quickFilters]);

  useEffect(() => {
    if (selectedCollection) {
      fetchProducts(selectedCollection);
    }
  }, [selectedCollection]);

  // Enter reorder mode: in-stock products only, highest popularity first
  const startReorder = () => {
    setOrderedItems(
      products
        .filter(isInStock)
        .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
    );
    setReorderMode(true);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setOrderedItems((items) => {
      const from = items.findIndex((i) => i.id === active.id);
      const to = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, from, to);
    });
  };

  // First position gets the highest score (N), last gets 1
  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const total = orderedItems.length;
      for (let i = 0; i < total; i += 400) {
        const batch = writeBatch(db);
        orderedItems.slice(i, i + 400).forEach((item, j) => {
          batch.update(doc(db, selectedCollection, item.id), {
            priorityScore: total - (i + j),
          });
        });
        await batch.commit();
      }
      await fetchProducts(selectedCollection);
      setReorderMode(false);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, selectedCollection, id));
      await fetchProducts(selectedCollection);
      alert("Item deleted successfully");
      // Optionally trigger re-fetch or state update to remove deleted item from UI
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete item");
    }
  };

  // if (!isAuthorized) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
  //       <h2 className="text-xl font-bold mb-4">Admin Access</h2>
  //       <input
  //         type="password"
  //         placeholder="Enter admin passkey"
  //         value={passkey}
  //         onChange={(e) => setPasskey(e.target.value)}
  //         className="border border-gray-300 px-4 py-2 rounded-md shadow-sm w-full max-w-xs"
  //       />
  //       <button
  //         onClick={handleLogin}
  //         className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-full max-w-xs"
  //       >
  //         Enter
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Manage Products
          </h1>
          <p className="text-gray-600 text-xs sm:text-base hidden sm:block">
            Select a collection to view and manage products
          </p>
        </div>

        {/* Collection Selection */}
        <div className="flex flex-wrap gap-1.5 sm:gap-4 mb-3 sm:mb-8">
          {collections.map((col) => (
            <button
              key={col}
              onClick={() => handleCollectionSelect(col)}
              className={`capitalize rounded-full border px-2.5 py-1 text-[11px] font-medium sm:rounded-2xl sm:border-2 sm:px-6 sm:py-5 sm:text-xl sm:font-semibold transition-colors ${
                selectedCollection === col
                  ? "border-rose-500 bg-rose-500 text-white sm:bg-rose-50 sm:text-gray-900"
                  : "border-amber-200 bg-amber-50 text-amber-800 hover:border-rose-300"
              }`}
            >
              {col}
            </button>
          ))}
        </div>

        {/* Back Button and Add Button */}
        {selectedCollection && (
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <button
              onClick={() => handleBackToCollections()}
              className="inline-flex items-center px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Collections
            </button>

            <button
              onClick={() =>
                navigate(`/admin/add/${selectedCollection.slice(0, -1)}`)
              }
              className="inline-flex items-center px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New
            </button>
          </div>
        )}

        {/* Product List */}
        {selectedCollection && (
          <>
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 capitalize">
                  {selectedCollection}
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span>
                      Total: <span className="font-medium">{products.length}</span> products
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></span>
                      Total Items: <span className="font-medium text-blue-600">{totalAllItems}</span> pieces
                    </span>
                  </div>
                  {(searchQuery || activeFilters.length > 0) && (
                    <div className="text-sm text-gray-500 mt-1">
                      Showing: <span className="font-medium">{filteredProducts.length}</span> products • <span className="font-medium text-blue-600">{totalItems}</span> items
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span className="font-medium">{totalItems}</span> items total
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-3 sm:mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-amber-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search products by name, ID, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-amber-200 rounded-lg leading-5 bg-amber-50 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Reorder toolbar */}
            {reorderMode ? (
              <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
                <p className="text-[11px] sm:text-sm text-amber-800">
                  Hold &amp; drag a tile. #1 is shown first on the website.
                </p>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setReorderMode(false)}
                    disabled={savingOrder}
                    className="px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white text-amber-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveOrder}
                    disabled={savingOrder}
                    className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 text-white disabled:opacity-60"
                  >
                    {savingOrder ? "Saving..." : "Save order"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startReorder}
                disabled={loading || products.length === 0}
                className="mb-3 px-3 py-1 text-xs sm:text-sm font-medium rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              >
                Reorder popularity (in stock)
              </button>
            )}

            {/* Quick Filters */}
            {!reorderMode && (
            <div className="mb-3 sm:mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FaFilter className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Quick Filters
                </span>
                {(activeFilters.length > 0 || searchQuery) && (
                  <div className="flex gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear Search
                      </button>
                    )}
                    {activeFilters.length > 0 && (
                      <button
                        onClick={() => setActiveFilters([])}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {quickFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilters.includes(filter.id);
                  return (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 
                        whitespace-nowrap text-sm font-medium min-w-max
                        ${isActive ? filter.activeColor : filter.color}
                        hover:scale-105 hover:shadow-md
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reorderMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedItems.map((i) => i.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                    {orderedItems.map((item, idx) => (
                      <SortableTile key={item.id} item={item} rank={idx + 1} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-4">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                  >
                    <div
                      onClick={() =>
                        navigate(
                          `/admin/edit/${selectedCollection.slice(0, -1)}/${
                            item.id
                          }`
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={item.mainImage}
                          alt={item.name}
                          className="w-full aspect-square sm:aspect-auto sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        {getLastPieceSizes(item).length > 0 && (
                          <div
                            title={`Only 1 left in size: ${getLastPieceSizes(
                              item
                            ).join(", ")}`}
                            className="absolute top-0.5 left-0.5 sm:top-2 sm:left-2 flex items-center gap-1 bg-amber-500 text-white text-[8px] sm:text-[10px] font-semibold px-1 sm:px-2 py-0.5 rounded-full shadow"
                          >
                            <FaExclamationTriangle className="w-2.5 h-2.5" />
                            <span>
                              1 left: {getLastPieceSizes(item).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-1 sm:p-4">
                        <h3 className="text-[9px] leading-tight sm:text-base truncate font-medium text-gray-900 sm:mb-1 group-hover:text-blue-600 transition-colors">
                          {item.name} {item.isRoyal && "R"}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-0 right-0 sm:top-2 sm:right-2 text-[10px] sm:text-xs px-1 sm:px-2 sm:py-1 rounded hover:bg-red-600 transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  This collection doesn&apos;t have any products yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
