import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const SearchBar = ({ productData }) => {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const [searchIndex, setSearchIndex] = useState([]);

  // Initialize search index
  useEffect(() => {
    const index = createSearchIndex(productData);
    setSearchIndex(index);
  }, [productData]);

  // Handle clicks outside search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update search results and suggestions when query changes
  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults([]);
      setSuggestions([]);
      return;
    }

    const results = searchProducts(query, searchIndex);
    setSearchResults(results);

    const typeaheadSuggestions = generateTypeaheadSuggestions(
      query,
      searchIndex
    );
    setSuggestions(typeaheadSuggestions);
  }, [query, searchIndex]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <div ref={searchRef} className="relative w-full md:max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsActive(true)}
          placeholder="Search for kurtas, colors, etc."
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown for suggestions and results */}
      <AnimatePresence>
        {isActive &&
          (query.trim() !== "" ||
            searchResults.length > 0 ||
            suggestions.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto"
            >
              {/* Typeahead Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2 border-b">
                  <p className="text-xs text-gray-500 px-2 py-1">Suggestions</p>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer flex items-center"
                    >
                      <Search size={14} className="text-gray-400 mr-2" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-2 py-1">
                    Products ({searchResults.length})
                  </p>
                  {searchResults.map((result) => (
                    <a
                      key={result.id}
                      href={`/product/${result.id}`}
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="w-12 h-12 rounded overflow-hidden">
                        <img
                          src={result.image}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{result.name}</p>
                        <p className="text-xs text-gray-500">
                          {result.subcategory.replace("-", " ")}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                query.trim() !== "" && (
                  <div className="p-6 text-center text-gray-500">
                    No results found for "{query}"
                  </div>
                )
              )}
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions
function createSearchIndex(productData) {
  const searchIndex = [];

  productData.subcategories.forEach((subcategory) => {
    subcategory.products.forEach((product) => {
      // Extract searchable text
      const searchableText = [
        product.name,
        product.description,
        productData.category,
        subcategory.name,
        // Extract colors from product names and descriptions
        ...extractColors(product.name + " " + product.description),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      searchIndex.push({
        id: product.id,
        category: productData.category,
        subcategory: subcategory.id,
        name: product.name,
        searchableText,
        image: product.mainImage,
        originalProduct: product,
      });
    });
  });

  return searchIndex;
}

function extractColors(text) {
  const commonColors = [
    "blue",
    "royal blue",
    "maroon",
    "red",
    "green",
    "black",
    "white",
    "pink",
    "purple",
    "yellow",
    "orange",
  ];
  return commonColors.filter((color) => text.toLowerCase().includes(color));
}

function searchProducts(query, searchIndex) {
  if (!query || query.trim() === "") return [];

  const normalizedQuery = query.toLowerCase().trim();

  return searchIndex.filter((item) =>
    item.searchableText.includes(normalizedQuery)
  );
}

function generateTypeaheadSuggestions(query, searchIndex) {
  if (!query || query.trim() === "") return [];

  const normalizedQuery = query.toLowerCase().trim();

  // Common categories and attributes to suggest
  const commonTerms = [
    // Categories and subcategories
    "kurtas",
    "solid kurtas",
    // Colors extracted from products
    "blue",
    "royal blue",
    "maroon",
    // Other common search terms
    "beaded",
    "full set",
  ];

  // Find matching common terms
  const termSuggestions = commonTerms
    .filter(
      (term) => term.includes(normalizedQuery) && term !== normalizedQuery
    )
    .slice(0, 5);

  // Find matching product names
  const productSuggestions = searchIndex
    .filter((item) => item.name.toLowerCase().includes(normalizedQuery))
    .map((item) => item.name)
    .slice(0, 3);

  return [...new Set([...termSuggestions, ...productSuggestions])];
}

export default SearchBar;
