import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Categories = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const categories = [
    {
      id: 1,
      name: "Tuxedo",
      description: "Classic Fits",
      image: "/images/cat-1.webp",
    },
    {
      id: 2,
      name: "Sherwani",
      description: "Traditional Elegance",
      image: "/images/cat-2.webp",
    },
    {
      id: 3,
      name: "Kurta",
      description: "Contemporary Styles",
      image: "/images/cat-3.webp",
    },
    {
      id: 4,
      name: "Bandana",
      description: "Trendy Accessories",
      image: "/images/cat-4.webp",
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
          <div className="flex gap-4 cursor-grab active:cursor-grabbing">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="min-w-[calc(50%-8px)] flex-grow-0 flex-shrink-0"
              >
                <div className="relative group cursor-pointer">
                  <div className="relative h-[300px] rounded-2xl overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                  </div>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 text-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                    <p className="text-gray-200 mb-3 text-sm">
                      {category.description}
                    </p>

                    <motion.button
                      className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium 
                             opacity-0 group-hover:opacity-100 transform translate-y-4 
                             group-hover:translate-y-0 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Shop Now
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {[...Array(categories.length - 1)].map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "bg-black w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
