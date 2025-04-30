import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function KurtaBanner() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full h-80 rounded-2xl overflow-hidden mx-auto my-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image with lighter overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/banner.png"
          alt="Dogs in traditional kurta outfits"
          className="w-full h-full object-cover"
        />
        {/* Lighter semi-transparent overlay */}
        <div className="absolute inset-0 bg-black/25"></div>
      </div>

      {/* Content container - adjusted to take less space */}
      <div className="relative h-full flex flex-col justify-end px-6 pb-6 text-white">
        <h2 className="text-2xl font-bold mb-1 tracking-tight leading-tight">
          From Pooch to Prince in Kurta
        </h2>
        <p className="text-gray-100 text-xs mb-3 max-w-xs">
          Dress your furry friend in royal elegance with our pet-friendly
          traditional wear
        </p>

        {/* Smaller CTA Button */}
        <Link to="/kurta">
          <button
            className={`flex items-center space-x-1 bg-white  text-gray-800 py-2 px-4 rounded-full font-medium text-sm w-fit 
          transition-all duration-300 ${
            isHovered ? "shadow-lg transform -translate-y-0.5" : "shadow"
          }`}
          >
            <span>Explore Now!</span>
            <ArrowRight
              size={14}
              className={`transition-transform duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
            />
          </button>
        </Link>
      </div>
    </div>
  );
}
