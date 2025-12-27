import { useState, useEffect, useMemo } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
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
} from "react-icons/fa";
const ADMIN_KEY = "What@270598";
const collections = [
  "kurtas",
  "frocks",
  "tuxedos",
  "tuts",
  "lehengas",
  "male-bandanas",
];

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get("category") || null
  );
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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
        filterFn: (product) => {
          const sizeStock = product.sizeStock || {};
          return (
            Object.values(sizeStock).some((stock) => stock > 0) ||
            product.availableStock > 0
          );
        },
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

  // Apply filters to products
  useEffect(() => {
    let filtered = [...products];

    if (activeFilters.length > 0) {
      const activeFilterObjects = quickFilters.filter((filter) =>
        activeFilters.includes(filter.id)
      );

      filtered = products.filter((product) =>
        activeFilterObjects.some((filter) => filter.filterFn(product))
      );
    }

    setFilteredProducts(filtered);
  }, [products, activeFilters, quickFilters]);

  useEffect(() => {
    if (selectedCollection) {
      fetchProducts(selectedCollection);
    }
  }, [selectedCollection]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Products
          </h1>
          <p className="text-gray-600">
            Select a collection to view and manage products
          </p>
        </div>

        {/* Collection Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {collections.map((col) => (
            <div
              key={col}
              onClick={() => handleCollectionSelect(col)}
              className={`
                relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300
                ${
                  selectedCollection === col
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold capitalize text-gray-900 mb-1">
                    {col}
                  </h2>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              {selectedCollection === col && (
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 pointer-events-none opacity-50"></div>
              )}
            </div>
          ))}
        </div>

        {/* Back Button and Add Button */}
        {selectedCollection && (
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => handleBackToCollections()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 capitalize">
                {selectedCollection}
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredProducts.length} of {products.length} items
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FaFilter className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Quick Filters
                </span>
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
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
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {item.name} {item.isRoyal && "R"}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
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
