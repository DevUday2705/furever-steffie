import { useState, useEffect } from "react";

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const MaleBandanas = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: maleBandanas } = useFirestoreCollection("male-bandanas");
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
      title="Male Bandanas"
      subtitle="Explore our exclusive range of handcrafted Male bandanas for pets!"
      category="male-bandanas"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1746007679/banner-min_pbtnwp.webp"
      products={maleBandanas}
      bannerTitle="Elegant Female Bandanas for Every Pet Personality"
    />
  );
};

export default MaleBandanas;
