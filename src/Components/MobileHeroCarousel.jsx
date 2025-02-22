import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MobileHeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/images/hero-1.jpeg",
      title: "Summer Collection",
      subtitle: "Explore our latest arrivals",
      cta: "Shop Now",
    },
    {
      id: 2,
      image: "/images/hero-2.jpeg",
      title: "Autumn Essentials",
      subtitle: "Curated styles for the season",
      cta: "Discover More",
    },
    {
      id: 3,
      image: "/images/hero-3.jpeg",
      title: "Premium Basics",
      subtitle: "Timeless wardrobe staples",
      cta: "View Collection",
    },
  ];
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 200, damping: 25 },
        opacity: { duration: 0.4 },
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 200, damping: 25 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const dragConstraints = {
    left: 0,
    right: 0,
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = slides.length - 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleDragEnd = (_, info) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        paginate(-1);
      } else {
        paginate(1);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-gray-900 rounded-md">
      <div className="relative w-full h-[60vh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="absolute w-full h-full"
          >
            <div className="relative w-full h-full">
              <motion.img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                className="w-full h-full object-cover rounded-md"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-md" />

              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute bottom-0 left-0 right-0 p-6 rounded-md"
                key={`content-${currentIndex}`}
              >
                <h2 className="text-3xl font-bold mb-2 text-white">
                  {slides[currentIndex].title}
                </h2>
                <p className="text-base mb-4 text-gray-200">
                  {slides[currentIndex].subtitle}
                </p>
                <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                  {slides[currentIndex].cta}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-10"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-10"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileHeroCarousel;
