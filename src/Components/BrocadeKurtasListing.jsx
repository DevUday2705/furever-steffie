import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { productData } from "../constants/constant";
import { ChevronLeft } from "lucide-react";

// This would normally be fetched from an API

const BrocadeKurtasListing = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // Get only the brocade kurtas subcategory
      const brocadeKurtas = productData.subcategories.find(
        (subcat) => subcat.id === "brocade-kurtas"
      );
      setProducts(brocadeKurtas.products);
      setIsLoading(false);
    }, 500);
  }, []);
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page in history
  };
  return (
    <div className="bg-gray-50 min-h-screen">
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
          <h1 className="text-2xl font-bold text-gray-800">Brocade Kurtas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Elegant brocade color kurtas for your furry friend's special
            occasions
          </p>
        </div>
      </div>

      {/* Product Grid - Always 2 columns */}
      <div className="container mx-auto px-3 py-4">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => {
            // Calculate the default price (full beaded set, size S)
            const defaultPrice =
              product.pricing.basePrice + product.pricing.beadedAdditional;

            // Calculate kurta only price (beaded, size S)
            const kurtaOnlyPrice =
              product.pricing.basePrice + product.pricing.beadedAdditional;

            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative pb-[125%]">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="absolute w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm">
                      New
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {product.name}
                    </h3>

                    <div className="mt-1">
                      <div className="flex items-baseline">
                        <span className="text-base font-bold text-gray-800">
                          ₹{defaultPrice}
                        </span>
                        <span className="ml-1 text-xs font-medium text-gray-500">
                          Set
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        <span>₹{kurtaOnlyPrice}</span>{" "}
                        <span className="ml-1">Kurta</span>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <motion.span
                        className="text-purple-600 font-medium text-xs"
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

export default BrocadeKurtasListing;
