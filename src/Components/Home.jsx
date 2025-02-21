import React from "react";
import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";
import TrendingProducts from "./TrendingProducts";
import Footer from "./Footer";

const Home = () => {
  return (
    <div>
      <MobileHeroCarousel />
      <Categories />
      <WatchAndBuy />
      <TrendingProducts />
      <Footer />
    </div>
  );
};

export default Home;
