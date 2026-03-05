import React, { useState } from "react";
import { useSearchSuggestions } from "../hooks/useSearchSuggestions";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react"; // optional icon

const UniversalSearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const { searchAll } = useSearchSuggestions();
  const navigate = useNavigate();

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length > 1) {
      const data = await searchAll(val);
      setResults(data);
    } else {
      setResults({});
    }
  };

  const handleClick = (product) => {
    navigate(`/product/${product.id}+${product.type}`);
    setQuery(""); // clear on redirect
    setResults({});
  };

  return (
    <div className="relative  w-full mt-5 mx-auto max-w-sm">
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500 transition">
        <Search size={18} className="text-gray-500" />
        <input
          value={query}
          onChange={handleInputChange}
          placeholder="Search products by name, style or color..."
          className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
        />
      </div>

      <AnimatePresence>
        {Object.keys(results).length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden max-h-96 overflow-y-auto"
          >
            {Object.entries(results).map(([category, products]) => (
              <div key={category} className="border-b border-gray-100 last:border-b-0">
                {/* Category Header */}
                <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {products.length} {category.charAt(0).toUpperCase() + category.slice(1)}
                  {products.length > 1 ? "s" : ""} found
                </div>
                
                {/* Product Thumbnails */}
                <div className="p-3 grid grid-cols-1 gap-2">
                  {products.slice(0, 3).map((product) => (
                    <motion.div
                      key={product.id}
                      onClick={() => handleClick(product)}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                          }}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {product.name}
                        </h4>
                        {product.pricing?.basePrice && (
                          <p className="text-xs text-gray-500">
                            ₹{product.pricing.basePrice}
                          </p>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <span className="text-xs text-gray-400">→</span>
                    </motion.div>
                  ))}
                  
                  {/* Show more indicator if there are more than 3 products */}
                  {products.length > 3 && (
                    <div className="text-center py-2">
                      <button 
                        onClick={() => navigate(`/${category}?search=${encodeURIComponent(query)}`)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        +{products.length - 3} more {category}s
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniversalSearchBar;
