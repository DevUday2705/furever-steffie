import React from "react";
import Lottie from "react-lottie";
import comingSoon from "../../public/animation/coming-soon.json";
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: comingSoon,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const TuxedoListing = () => {
  return (
    <div className="min-h-screen w-full flex items-start justify-center ">
      <Lottie options={defaultOptions} height={200} />
    </div>
  );
};

export default TuxedoListing;
