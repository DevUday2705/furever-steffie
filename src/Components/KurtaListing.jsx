import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { kurtas } from "../constants/constant";
import { ChevronLeft } from "lucide-react";

const KurtaListing = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      const sortedKurtas = kurtas.sort(
        (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
      );
      setProducts(sortedKurtas);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleGoBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-3">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-600"
          >
            <ChevronLeft size={18} />
            <span className="ml-1 text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">
            All Kurtas
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Explore our exclusive range of handcrafted kurtas for pets!
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-3 py-4">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => {
            const basePrice = product.pricing.basePrice || 0;
            const beadedAdd = product.pricing.beadedAdditional || 0;

            const defaultPrice = product.isBeadedAvailable
              ? basePrice + beadedAdd
              : basePrice;

            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <Link to={`/product/${product.id}+${product.type}`}>
                  <div className="relative pb-[125%] overflow-hidden">
                    <motion.img
                      src={product.mainImage}
                      alt={product.name}
                      className="absolute w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                    />

                    {/* 🎯 BADGES */}
                    {product.priorityScore >= 90 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow">
                        Best Seller
                      </div>
                    )}
                    {product.availableStock <= 5 && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow">
                        Few Left
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3
                      className="text-sm font-medium text-gray-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    <div className="mt-1">
                      <div className="flex items-baseline">
                        <span className="text-base font-bold text-gray-800">
                          ₹{defaultPrice}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <motion.span
                        className="text-gray-600 font-medium text-xs"
                        whileHover={{ x: 2 }}
                      >
                        View Details →
                      </motion.span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KurtaListing;
