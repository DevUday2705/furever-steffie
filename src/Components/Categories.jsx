// Updated Categories Component with Gender Toggle
import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
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
  const { gender, setGender } = useAppContext();

  const maleCategories = [
    {
      id: 1,
      name: "Kurta",
      description: "Contemporary Styles",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1745862448/with_lace-min_ze5iom.png",
    },
    {
      id: 2,
      name: "Tuxedo",
      description: "Classic Fits",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/f_auto,q_auto,w_600/v1744095275/ChatGPT_Image_Apr_8_2025_11_56_25_AM_d5f2f5.png",
    },
    {
      id: 3,
      name: "Bandana",
      description: "Trendy Accessories",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/f_auto,q_auto,w_600/v1744095269/ChatGPT_Image_Apr_8_2025_11_39_17_AM_fuvhxw.png",
    },
    {
      id: 4,
      name: "Bow Tie",
      description: "Suit Up!",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/f_auto,q_auto,w_600/v1744099695/ChatGPT_Image_Apr_8_2025_01_37_49_PM_mqrwhi.png",
    },
  ];

  const femaleCategories = [
    {
      id: 7,
      name: "Frock",
      description: "Playful Frills",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/cherry_red_polka_dot_frock_d3cspz.webp",
    },
    {
      id: 5,
      name: "Lehenga",
      description: "Traditional Elegance",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/f_auto,q_auto,w_600/v1744096705/ChatGPT_Image_Apr_8_2025_11_45_38_AM_xdfndo.png",
    },
    {
      id: 6,
      name: "Tutu Dress",
      description: "Traditional Elegance",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/White_Whisper_with_Bow_dce8nr.webp",
    },

    {
      id: 8,
      name: "Bandana",
      description: "Trendy Accessories",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1745436600/ChatGPT_Image_Apr_24_2025_12_54_24_AM_1_siiyl6.png",
    },
    {
      id: 9,
      name: "Bow Set",
      description: "Cute Touch",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913361/ChatGPT_Image_Apr_17_2025_01_02_11_AM_sp7jye.png",
    },
  ];

  const categories = gender === "male" ? maleCategories : femaleCategories;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    setSelectedIndex(Math.round(progress * Math.ceil(categories.length / 2)));
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi, categories.length]);

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

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(0); // Reset to first slide when gender changes
  }, [gender, emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.scrollTo(index * 2);
    },
    [emblaApi]
  );

  const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Toggle Switch */}
        <div className="flex justify-center gap-4 mb-8">
          {["male", "female"].map((type) => (
            <button
              key={type}
              onClick={() => setGender(type)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border
              ${
                gender === type
                  ? "bg-black text-white border-black scale-105"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`w-10 h-10 rounded-full border flex items-center justify-center
              ${
                !canScrollPrev
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-50"
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
              className={`w-10 h-10 rounded-full border flex items-center justify-center
              ${
                !canScrollNext
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-50"
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

        {/* Carousel */}
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="min-w-[calc(50%-8px)] w-[calc(50%-8px)] flex-shrink-0"
              >
                <Link
                  to={`/${generateSlug(category.name)}`}
                  className="block relative group"
                >
                  <div className="relative h-[300px] rounded-2xl overflow-hidden">
                    <img
                      loading="lazy"
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold mb-1">
                      {category.name}{" "}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        🔗
                      </span>
                    </h3>
                    <p className="text-gray-200 text-sm">
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
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300
              ${selectedIndex === index ? "bg-black w-4" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
