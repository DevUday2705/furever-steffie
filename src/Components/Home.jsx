import React from "react";
import MobileHeroCarousel from "./MobileHeroCarousel";
import Categories from "./Categories";
import WatchAndBuy from "./WatchAndBuy";

const Home = () => {
  return (
    <div>
      <MobileHeroCarousel />
      <Categories />
      <WatchAndBuy />
    </div>
  );
};

export default Home;
