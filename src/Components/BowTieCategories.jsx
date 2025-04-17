import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

import { Link } from "react-router-dom";

const BowTieCategories = () => {
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
      name: "Male Bows",
      description: "Timeless elegance in pure colors",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744830312/ChatGPT_Image_Apr_16_2025_11_51_23_PM_mggtv4.png",
      url: "/male-bows",
    },
    {
      id: 2,
      name: "Female Bows",
      description: "Bold patterns & modern designs",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744832613/ChatGPT_Image_Apr_17_2025_12_42_40_AM_ftwmcc.png",
      url: "/female-bows",
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
            src="https://res.cloudinary.com/di6unrpjw/image/upload/v1744105628/ChatGPT_Image_Apr_8_2025_03_12_42_PM_ssfxpx.png"
            alt="Bows Collection"
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
                Bows Collection
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                Explore our handcrafted Bows, blending tradition with modern
                elegance.
              </p>
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
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform group-hover:translate-y-[-8px] transition-transform duration-500">
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        {category.name}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          🔗
                        </span>
                      </h3>
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

export default BowTieCategories;
