// src/components/ProductDetail/CustomColorEnquiry.jsx

import React, { useState } from "react";
import { Check } from "lucide-react";

const CustomColorEnquiry = ({ product }) => {
  const [customColor, setCustomColor] = useState("");

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    if (!customColor.trim()) return; // Do nothing if no color entered

    const message = `Hi! I'm interested in ${product.name} (ID: ${product.id}) in ${customColor} color. Is it available?`;
    window.open(
      `https://wa.me/+918828145667?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="flex items-start">
        <Check className="mr-2 mt-0.5 text-gray-800" size={16} />
        <div className="flex-1">
          <h3 className="text-xs font-medium text-gray-900">
            Looking for a specific color?
          </h3>

          <div className="mt-2 flex items-center">
            <input
              type="text"
              placeholder="Enter desired color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="text-xs p-1.5 border border-gray-300 rounded-md mr-2 w-full"
            />
            <a
              href="#"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center text-white text-xs py-1.5 px-3 rounded-md "
            >
              <img className="h-5" src="/images/wssp.png" alt="WhatsApp" />
            </a>
          </div>

          <p className="mt-1.5 text-xs text-gray-500">
            We'll check availability and get back to you quickly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomColorEnquiry;
