import React from "react";
import { ChevronLeft } from "lucide-react";

const BackButton = ({ onClick }) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-3 py-2">
        <button
          onClick={onClick}
          className="inline-flex items-center text-gray-600"
        >
          <ChevronLeft size={18} />
          <span className="ml-1 text-sm">Back</span>
        </button>
      </div>
    </div>
  );
};

export default BackButton;
