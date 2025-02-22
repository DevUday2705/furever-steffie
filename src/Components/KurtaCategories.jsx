import React from "react";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const KurtaCategories = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const categories = [
    {
      id: 1,
      name: "Solid Kurtas",
      description: "Timeless elegance in pure colors",
      image: "/images/kur-1.webp",
    },
    {
      id: 2,
      name: "Printed Fabric",
      description: "Bold patterns & modern designs",
      image: "/images/kur-2.jpg",
    },
    {
      id: 3,
      name: "Brocade Fabric",
      description: "Rich traditional patterns",
      image: "/images/kur-3.avif",
    },
    {
      id: 4,
      name: "Full Work Fabric",
      description: "Intricately detailed designs",
      image: "/images/kur-4.jpg",
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

  // Animation variants for grid items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-white">
      {/* Hero Section with Carousel */}
      <section className="pt-8 ">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Explore Kurta Styles
            </h1>
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

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="min-w-[300px] sm:min-w-[400px] flex-shrink-0"
                >
                  <motion.div
                    className="relative group cursor-pointer rounded-2xl overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative h-[200px] sm:h-[450px]">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">
                        {category.name}
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-5 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Featured Categories
          </h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className="group cursor-pointer"
                variants={item}
              >
                <div className="relative h-[400px] rounded-2xl overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform group-hover:translate-y-[-8px] transition-transform duration-300">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-200 text-sm mb-4 opacity-90">
                      {category.description}
                    </p>
                    <motion.button
                      className="inline-flex items-center bg-white text-black px-6 py-2 rounded-full text-sm font-medium 
                             transform opacity-0 group-hover:opacity-100 translate-y-4 
                             group-hover:translate-y-0 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Collection
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default KurtaCategories;
