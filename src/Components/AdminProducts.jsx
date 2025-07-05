import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const collections = ["kurtas", "frocks"];

const AdminProducts = () => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (selectedCollection) {
      fetchProducts(selectedCollection);
    }
  }, [selectedCollection]);

  console.log(products);

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
              onClick={() => setSelectedCollection(col)}
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
                  <p className="text-sm text-gray-500">
                    View and manage all {col}
                  </p>
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
              onClick={() => setSelectedCollection(null)}
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
                {products.length} items
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3">
                {products.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate(
                        `/admin/edit/${selectedCollection.slice(0, -1)}/${
                          item.id
                        }`
                      )
                    }
                    className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300"
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
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Click to edit details
                      </p>
                    </div>
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
                  This collection doesn't have any products yet.
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
