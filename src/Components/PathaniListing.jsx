import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const PathaniListing = () => {
  const { data: pathanis, isLoading } = useFirestoreCollection("pathanis");
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }
  console.log(pathanis);

  return (
    <ProductListing
      title="All Pathanis"
      subtitle="Explore our exclusive range of handcrafted pathanis for pets!"
      category="pathani"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1757398143/0540a2ed-145f-40c4-8ddd-d258dfef4303.png"
      products={pathanis}
      bannerTitle="Classic Pathanis for Every Pet Personality"
    />
  );
};

export default PathaniListing;