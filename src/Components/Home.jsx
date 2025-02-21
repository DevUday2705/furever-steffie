import React from "react";
import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";
import TrendingProducts from "./TrendingProducts";

const Home = () => {
  return (
    <div>
      <MobileHeroCarousel />
      <Categories />
      <WatchAndBuy />
      <TrendingProducts />
    </div>
  );
};

export default Home;
