import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const LehengaListing = () => {
  const { data: lehengas, isLoading } = useFirestoreCollection("lehengas");
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }
  console.log(lehengas);

  return (
    <ProductListing
      title="All Kurtas"
      subtitle="Explore our exclusive range of handcrafted kurtas for pets!"
      category="lehenga"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1757398143/0540a2ed-145f-40c4-8ddd-d258dfef4303.png"
      products={lehengas}
      bannerTitle="Elegant Kurtas for Every Pet Personality"
    />
  );
};

export default LehengaListing;
