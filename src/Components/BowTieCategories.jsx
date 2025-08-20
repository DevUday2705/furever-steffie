import { useState, useEffect } from "react";

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const BowTieCategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: bowTieCategories } = useFirestoreCollection("bow-tie");
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
      title="Bow Ties"
      subtitle="Explore our exclusive range of handcrafted bow ties for pets!"
      category="bow-tie"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1744105473/ChatGPT_Image_Apr_8_2025_02_57_58_PM_bu60ao.png"
      products={bowTieCategories}
      bannerTitle="Elegant Bow Ties for Every Pet Personality"
    />
  );
};

export default BowTieCategories;
