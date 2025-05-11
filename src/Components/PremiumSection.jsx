import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Crown, Star, Tag } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const PremiumSection = ({ products }) => {
  // Filter only premium products
  const premiumProducts = products.filter(
    (product) => product.category === "royal"
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isShining, setIsShining] = useState(false);
  const { gender } = useAppContext();

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const calculateDiscountPrice = (product) => {
    const { basePrice, discountPercent } = product.pricing;
    return basePrice - basePrice * (discountPercent / 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Trigger shine effect periodically
  useEffect(() => {
    // Initial shine after component mounts
    const initialTimer = setTimeout(() => {
      triggerShine();
    }, 1000);

    // Set up interval for repeated shine effect
    const intervalId = setInterval(() => {
      triggerShine();
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, []);

  const triggerShine = () => {
    setIsShining(true);
    setTimeout(() => setIsShining(false), 2500);
  };
  return (
    <section
      style={{
        backgroundPosition: "0px -160px ",
      }}
      className="py-8  bg-[length:100%_auto] bg-no-repeat bg-[url(/images/mandana.png)]"
    >
      <div className="container mx-auto px-4 ">
        {/* Section Header with premium styling */}
        <div className="relative mb-6 text-center">
          <div className="flex items-center relative left-20 justify-center mb-1">
            <span className="relative text-[#cd9f4b] text-4xl font-mont uppercase tracking-wider font-black">
              <span className="shine-text block">ROYAL</span>
              <Crown className="absolute right-[1.7rem] -top-5" size={24} />
            </span>
          </div>
          <h1 className="shine-text text-[#cd9f4b] font-mont font-semibold text-xl relative -top-2 -right-[5rem]">
            COLLECTIONS
          </h1>
        </div>

        {/* Premium Products Carousel */}
        <div className="relative mb-4">
          {/* Main carousel container with fixed width to show only one slide */}
          <div className="overflow-hidden max-w-[280px] mx-auto" ref={emblaRef}>
            <div className="flex">
              {premiumProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="min-w-[280px]  w-full  flex-shrink-0  rounded-md "
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to={`/product/${product.id}+${product.type}`}
                    className="block group"
                  >
                    <div className="relative rounded-lg overflow-hidden border border-gray-500/30 bg-white">
                      {/* Discount badge if applicable */}

                      {/* Product image with responsive height and aspect ratio */}
                      <div className="relative pb-[125%] overflow-hidden">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      </div>

                      {/* Enhanced product details with premium styling */}
                      <div className="p-4 bg-white ">
                        <div className="flex items-center mb-1">
                          <Crown color="#cd9f4b" className="mr-2" size={16} />
                          <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-800 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {product.pricing.discountPercent > 0 ? (
                            <>
                              <span className="text-base font-bold text-gray-900">
                                {formatPrice(calculateDiscountPrice(product))}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.pricing.basePrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-gray-900">
                              {formatPrice(product.pricing.basePrice)}
                            </span>
                          )}

                          {/* Small shopping bag icon */}
                          <div className="ml-auto rounded-full w-6 h-6 bg-black/10 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-black"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation buttons - now visible for better navigation */}
          <div>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`absolute top-1/2 left-0 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 z-10
              ${!canScrollPrev ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`absolute top-1/2 right-0 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 z-10
              ${!canScrollNext ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          {premiumProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300
              ${selectedIndex === index ? "bg-[#cd9f4b] w-6" : "bg-gray-300"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Premium CTA button */}
        <div className="flex justify-center mt-6">
          {/* Button container with overflow hidden */}
          <div className="relative overflow-hidden rounded-md">
            {/* The button itself */}
            <Link
              to="/premium-collection"
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#e2c275] via-[#cd9f4b] to-[#e2c275] text-white font-medium rounded-md transition-all duration-300 hover:bg-gradient-to-r hover:from-[#d4b05e] hover:via-[#bf9232] hover:to-[#d4b05e] shadow-md border border-[#e9d396] border-opacity-30"
              onMouseEnter={() => triggerShine()}
            >
              View Full Royal Collection
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>

            {/* Shine effect using Framer Motion */}
            <motion.div
              className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              initial={{ x: "-100%", skewX: -30 }}
              animate={isShining ? { x: "300%" } : { x: "-100%" }}
              transition={
                isShining
                  ? { duration: 1.5, ease: "easeInOut" }
                  : { duration: 0 }
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
