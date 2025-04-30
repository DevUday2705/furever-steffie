import React from "react";
import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";
import TrendingProducts from "./TrendingProducts";
import Footer from "./Footer";
import KurtaBanner from "./KurtaBanner";

const Home = () => {
  return (
    <div>
      <MobileHeroCarousel />
      {/* <Categories /> */}
      <KurtaBanner />
      <WatchAndBuy />
      <TrendingProducts />
      <Footer />
    </div>
  );
};

export default Home;
