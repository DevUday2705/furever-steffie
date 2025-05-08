import { useState, useEffect } from "react";

import { frocks } from "../constants/constant";

import ProductListing from "./ProductListing";

const FrockListing = () => {
  const [isLoading, setIsLoading] = useState(true);

  // 1) Base list
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <ProductListing
      title="All Frocks"
      subtitle="Explore our exclusive range of handcrafted frocks for pets!"
      category="frock"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1746704011/banner_yge1ej.webp"
      products={frocks}
      bannerTitle="Elegant Frocks for Every Pet Personality"
    />
  );
};

export default FrockListing;
