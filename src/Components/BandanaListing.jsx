import { useState, useEffect } from "react";

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const BandanaListing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { kurtas: data } = useFirestoreCollection("kurtas");
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
      title="All Kurtas"
      subtitle="Explore our exclusive range of handcrafted kurtas for pets!"
      category="kurta"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1746007679/banner-min_pbtnwp.webp"
      products={kurtas}
      bannerTitle="Elegant Kurtas for Every Pet Personality"
    />
  );
};

export default BandanaListing;
