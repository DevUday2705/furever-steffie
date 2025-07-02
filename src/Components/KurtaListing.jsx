import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

import ProductListing from "./ProductListing";

const KurtaListing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchKurtas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "kurtas"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching kurtas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKurtas();
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
      products={products}
      bannerTitle="Elegant Kurtas for Every Pet Personality"
    />
  );
};

export default KurtaListing;
