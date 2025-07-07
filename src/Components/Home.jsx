import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";
import PremiumSection from "./PremiumSection";
import Footer from "./Footer";
import Footer2 from "./Footer2";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TrendingProducts from "./TrendingProducts";
import { useAppContext } from "../context/AppContext";
import { getTopProductsByGender } from "../constants/constant";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const phoneNumber = "918828145667"; // change to your WhatsApp business number (with country code)
  const message = encodeURIComponent(
    "Hi! I'm interested in your pet outfits on Furever Steffie. Can you help me place an order?"
  );
  const { gender } = useAppContext();
  const [products, setProducts] = useState([]);
  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getTopProductsByGender(gender);
        setProducts(data);
      } finally {
        setIsLoading(false); // This should happen after products are set
      }
    };
    fetchProducts();
  }, [gender]);
  console.log(products);
  return (
    <div>
      <MobileHeroCarousel />
      <Categories />
      <PremiumSection products={products} loading={isLoading} />

      <WatchAndBuy />
      <TrendingProducts />
      <Footer2 />
      <a
        href={`https://wa.me/${phoneNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 z-50 hover:scale-105 transition-transform"
      >
        <img
          src="https://img.icons8.com/color/48/whatsapp--v1.png"
          alt="Chat on WhatsApp"
          className="w-10 h-10"
        />
      </a>
    </div>
  );
};

export default Home;
