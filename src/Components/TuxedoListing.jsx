import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

import ProductListing from "./ProductListing";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const TuxedoListing = () => {
  const { data: tuxedos, isLoading } = useFirestoreCollection("tuxedos");
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header section */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Filter section skeleton */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Products grid skeleton */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductListing
      title="All Tuxedos"
      subtitle="Explore our exclusive range of handcrafted kurtas for pets!"
      category="tuxedo"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1753618664/Luxury_navy_blue_Sets_for_Pets_bnp2ck.webp"
      products={tuxedos}
      bannerTitle="Elegant Tuxedos for Every Pet Personality"
    />
  );
};

export default TuxedoListing;
