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

  const handleClick = (category) => {
    navigate(`/${category}?search=${encodeURIComponent(query)}`);
    setQuery(""); // clear on redirect
    setResults({});
  };

  return (
    <div className="relative w-full mt-5 max-w-md mx-auto">
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
            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
          >
            {Object.entries(results).map(([category, count]) => (
              <motion.div
                key={category}
                onClick={() => handleClick(category)}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                className="px-4 py-3 text-sm text-gray-800 font-medium cursor-pointer flex justify-between items-center transition-colors"
              >
                <span>
                  {count} {category.charAt(0).toUpperCase() + category.slice(1)}
                  {count > 1 ? "s" : ""} found
                </span>
                <span className="text-xs text-gray-400">→</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniversalSearchBar;
