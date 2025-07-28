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
  console.log(kurtas);

  return (
    <ProductListing
      title="All Kurtas"
      subtitle="Explore our exclusive range of handcrafted kurtas for pets!"
      category="kurta"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1753619355/554E70EA-8215-4CEF-804D-766586922143_Copy_rdst4h.webp"
      products={kurtas}
      bannerTitle="Elegant Kurtas for Every Pet Personality"
    />
  );
};

export default KurtaListing;
