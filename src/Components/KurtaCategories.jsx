import React from "react";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

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
      name: "Solid",
      description: "Timeless elegance in pure colors",
      image: "/images/kur-1.webp",
      url: "/solid-kurtas",
    },
    {
      id: 2,
      name: "Printed",
      description: "Bold patterns & modern designs",
      image: "/images/kur-2.jpg",
      url: "/printed-kurtas",
    },
    {
      id: 3,
      name: "Brocade",
      description: "Rich traditional patterns",
      image: "/images/kur-3.avif",
      url: "/brocade-kurtas",
    },
    {
      id: 4,
      name: "Full Work",
      description: "Intricately detailed designs",
      image: "/images/kur-4.jpg",
      url: "/full-work-kurtas",
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
        staggerChildren: 0.2, // Increased from 0.1 for smoother staggering
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8, // Increased duration
        ease: "easeOut", // Smoother easing function
      },
    },
  };

  return (
    <div className="bg-white">
      <section className="relative h-[500px] overflow-hidden rounded-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/kur-1.webp"
            alt="Kurta Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 h-full">
          <div className="relative h-full flex flex-col justify-end pb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2, // Increased duration
                ease: "easeOut", // Smoother easing
              }}
              className="max-w-2xl text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Kurta Collection
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                Explore our handcrafted kurtas, blending tradition with modern
                elegance.
              </p>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium inline-flex items-center 
                       hover:bg-gray-100 transition-colors duration-200"
              >
                Explore Collection
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Optional: Design Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-white/10 to-transparent blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-black/20 to-transparent blur-3xl"
        />
      </section>

      {/* Featured Categories Grid */}
      <section className="py-5 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Featured Categories
          </h2>

          <motion.div
            className="grid grid-cols-2 gap-6"
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
                <Link to={category.url}>
                  <div className="relative h-[300px] rounded-2xl overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" // Increased duration
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform group-hover:translate-y-[-8px] transition-transform duration-500">
                      {" "}
                      {/* Increased duration */}
                      <h3 className="text-2xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <motion.button
                        className="inline-flex items-center bg-white text-black px-6 py-2 rounded-full text-sm font-medium 
                           transform opacity-0 group-hover:opacity-100 translate-y-4 
                           group-hover:translate-y-0 transition-all duration-500" // Increased duration
                        whileHover={{
                          scale: 1.05,
                          transition: { duration: 0.3, ease: "easeOut" },
                        }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 },
                        }}
                      >
                        Explore
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default KurtaCategories;
