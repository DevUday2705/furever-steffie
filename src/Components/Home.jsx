import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";
import PremiumSection from "./PremiumSection";
import Footer from "./Footer";

import { kurtas } from "../constants/constant";
const Home = () => {
  const phoneNumber = "918828145667"; // change to your WhatsApp business number (with country code)
  const message = encodeURIComponent(
    "Hi! I'm interested in your pet outfits on Furever Steffie. Can you help me place an order?"
  );

  return (
    <div>
      <MobileHeroCarousel />
      <Categories />
      <PremiumSection products={kurtas} />
      <WatchAndBuy />
      <Footer />
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
