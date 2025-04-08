import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Categories = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 2,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const categories = [
    {
      id: 3,
      name: "Kurta",
      description: "Contemporary Styles",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744096630/ChatGPT_Image_Apr_7_2025_06_11_27_PM_rz1anz.png",
    },
    {
      id: 1,
      name: "Tuxedo",
      description: "Classic Fits",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744095275/ChatGPT_Image_Apr_8_2025_11_56_25_AM_d5f2f5.png",
    },
    {
      id: 2,
      name: "Lehenga",
      description: "Traditional Elegance",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744096705/ChatGPT_Image_Apr_8_2025_11_45_38_AM_xdfndo.png",
    },
    {
      id: 4,
      name: "Bandana",
      description: "Trendy Accessories",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744095269/ChatGPT_Image_Apr_8_2025_11_39_17_AM_fuvhxw.png",
    },
    {
      id: 5,
      name: "Bow Tie",
      description: "Suit Up!",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744099695/ChatGPT_Image_Apr_8_2025_01_37_49_PM_mqrwhi.png",
    },
  ];

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    // Get the current scroll progress
    const progress = emblaApi.scrollProgress();
    // Calculate the selected index based on progress
    // For 4 items showing 2 at a time, progress will be 0, 0.5, or 1
    // Multiply by 2 to get 0, 1 for our dot index
    const index = Math.round(progress * 2);
    setSelectedIndex(index);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("scroll", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("scroll", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index) => {
      if (!emblaApi) return;
      // Convert dot index to slide index (multiply by 2 since we show 2 slides at a time)
      emblaApi.scrollTo(index * 2);
    },
    [emblaApi]
  );
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 
              ${
                !canScrollPrev
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <ChevronLeft
                className={`w-5 h-5 ${
                  !canScrollPrev ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200
              ${
                !canScrollNext
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <ChevronRight
                className={`w-5 h-5 ${
                  !canScrollNext ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="min-w-[calc(50%-8px)] w-[calc(50%-8px)] flex-shrink-0"
              >
                <Link
                  to={`/${generateSlug(category.name)}`}
                  className="block relative group cursor-pointer"
                >
                  <div className="relative h-[300px] rounded-2xl overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                  </div>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 text-white flex items-start justify-between flex-col"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      {category.name}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        🔗
                      </span>
                    </h3>
                    <p className="text-gray-200 mb-3 text-sm">
                      {category.description}
                    </p>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(Math.ceil(categories.length / 2))].map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                selectedIndex === index ? "bg-black w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
