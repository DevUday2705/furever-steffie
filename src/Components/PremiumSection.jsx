import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Tag } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const PremiumSection = ({ products }) => {
  // Filter only premium products
  const premiumProducts = products.filter(
    (product) => product.category === "premium"
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
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

  const generateSlug = (id, name) =>
    `${id}-${name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header with premium styling */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="w-4 h-4 text-black mr-1" fill="currentColor" />
            <span className="text-black font-medium uppercase tracking-wider text-xs">
              Exclusive Collection
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Premium Selections
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Discover our curated collection of premium designs crafted with
            exceptional quality and attention to detail.
          </p>
        </div>

        {/* Premium Products Carousel */}
        <div className="relative mb-4">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex pl-4">
              {premiumProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="min-w-[280px] md:min-w-[320px] px-2 flex-shrink-0"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to={`/product/${product.id}+${product.type}`}
                    className="block group"
                  >
                    <div className="relative rounded-lg overflow-hidden shadow-md bg-white">
                      {/* Discount badge if applicable */}
                      {product.pricing.discountPercent > 0 && (
                        <div className="absolute top-3 left-3 z-10 animate-pulse">
                          <div className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center shadow-lg">
                            <Tag className="w-3 h-3 mr-1" />
                            <span className="font-bold">
                              {product.pricing.discountPercent}% OFF
                            </span>
                          </div>
                        </div>
                      )}

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
                      <div className="p-4 bg-white">
                        <div className="flex items-center mb-1">
                          <div className="w-1 h-4 bg-black rounded-full mr-2"></div>
                          <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-800 transition-colors">
                            {product.name}
                          </h3>
                          <div className="ml-auto">
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-sm font-medium">
                              PREMIUM
                            </span>
                          </div>
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

          {/* Navigation buttons - commented out as per original */}
          {/* <div>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 z-10
              ${!canScrollPrev ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 z-10
              ${!canScrollNext ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div> */}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          {premiumProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300
              ${selectedIndex === index ? "bg-black w-6" : "bg-gray-300"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Premium CTA button */}
        <div className="flex justify-center mt-6">
          <Link
            to="/premium-collection"
            className="inline-flex items-center px-6 py-2 bg-black text-white font-medium rounded-md transition-all duration-300 hover:bg-gray-800"
          >
            View Full Premium Collection
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
