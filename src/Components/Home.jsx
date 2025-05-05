import React from "react";
import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";
import TrendingProducts from "./TrendingProducts";
import PremiumSection from "./PremiumSection";
import Footer from "./Footer";
import KurtaBanner from "./KurtaBanner";
import PremiumSectionCarousel from "./PremiumSection";

const Home = () => {
  return (
    <div>
      <MobileHeroCarousel />
      <Categories />
      <PremiumSectionCarousel />
      {/* <KurtaBanner /> */}
      <WatchAndBuy />
      {/* <TrendingProducts /> */}
      <Footer />
    </div>
  );
};

export default Home;
