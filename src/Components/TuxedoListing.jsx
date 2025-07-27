import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const TuxedoListing = () => {
  const { data: tuxedos, isLoading } = useFirestoreCollection("tuxedos");
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <ProductListing
      title="All Tuxedos"
      subtitle="Explore our exclusive range of handcrafted kurtas for pets!"
      category="tuxedo"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1746007679/banner-min_pbtnwp.webp"
      products={tuxedos}
      bannerTitle="Elegant Tuxedos for Every Pet Personality"
    />
  );
};

export default TuxedoListing;
