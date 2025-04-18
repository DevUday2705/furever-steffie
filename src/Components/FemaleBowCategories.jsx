import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { bowData } from "../constants/constant";
const FemaleBowCategories = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // Get only the solid kurtas subcategory
      const solidKurtas = bowData.subcategories.find(
        (subcat) => subcat.id === "female-bow"
      );
      setProducts(solidKurtas.products);
      setIsLoading(false);
    }, 500);
  }, []);
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
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
          <h1 className="text-2xl font-bold text-gray-800 capitalize">
            MALE BOWS
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Elegant solid color bows for your furry friend's special occasions
          </p>
        </div>
      </div>

      {/* Product Grid - Always 2 columns */}
      <div className="container mx-auto px-3 py-4">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => {
            // Calculate the default price (full beaded set, size S)

            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <Link to={`/product/${product.id}+bows`}>
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
                          ₹{product.pricing.basePrice}
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

export default FemaleBowCategories;
