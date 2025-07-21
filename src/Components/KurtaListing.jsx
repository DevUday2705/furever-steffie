import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const KurtaListing = () => {
  const { data: kurtas, isLoading } = useFirestoreCollection("kurtas");
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

export default KurtaListing;
