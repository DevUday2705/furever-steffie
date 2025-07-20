import { useState, useEffect } from "react";

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const FrockListing = () => {
  const { data: frocks, isLoading } = useFirestoreCollection("frocks");

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
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1753033327/Frock-poster_mx9qyr.webp"
      products={frocks}
      bannerTitle="Elegant Frocks for Every Pet Personality"
    />
  );
};

export default FrockListing;
