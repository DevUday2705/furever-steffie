import React, { useState } from "react";
import { useSearchSuggestions } from "../hooks/useSearchSuggestions";
import { useNavigate } from "react-router-dom";

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
    // navigate(`/${category}?search=${encodeURIComponent(query)}`);
    console.log(
      `Hello - Navigating to /${category}?search=${encodeURIComponent(query)}`
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        value={query}
        onChange={handleInputChange}
        placeholder="Search products..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {Object.keys(results).length > 0 && (
        <div className="absolute mt-2 w-full bg-white border rounded shadow-lg z-10">
          {Object.entries(results).map(([category, count]) => (
            <div
              key={category}
              onClick={() => handleClick(category)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {count} {category.charAt(0).toUpperCase() + category.slice(1)}
              {count > 1 ? "s" : ""} found
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalSearchBar;
