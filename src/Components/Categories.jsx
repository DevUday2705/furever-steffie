import React, { useState } from "react";
import { motion, useAnimation, useDragControls } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Categories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const dragControls = useDragControls();

  const categories = [
    {
      id: 1,
      name: "Tuxedo",
      description: "Classic & Modern Fits",
      image: "/images/cat-1.jpeg",
    },
    {
      id: 2,
      name: "Sherwani",
      description: "Traditional Elegance",
      image: "/images/cat-2.jpeg",
    },
    {
      id: 3,
      name: "Kurta",
      description: "Contemporary Styles",
      image: "/images/cat-3.jpeg",
    },
    {
      id: 4,
      name: "Bandana",
      description: "Trendy Accessories",
      image: "/images/cat-4.jpeg",
    },
  ];

  const nextSlide = () => {
    if (currentIndex < categories.length - 2) {
      setCurrentIndex(currentIndex + 1);
      controls.start({ x: `-${(currentIndex + 1) * 50}%` });
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      controls.start({ x: `-${(currentIndex - 1) * 50}%` });
    }
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        prevSlide();
      } else if (info.offset.x < 0 && currentIndex < categories.length - 2) {
        nextSlide();
      } else {
        // Snap back if at the ends
        controls.start({ x: `-${currentIndex * 50}%` });
      }
    } else {
      // Snap back if swipe wasn't strong enough
      controls.start({ x: `-${currentIndex * 50}%` });
    }
  };

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === categories.length - 2;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={isAtStart}
              className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 
                ${
                  isAtStart
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <ChevronLeft
                className={`w-5 h-5 ${
                  isAtStart ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
            <button
              onClick={nextSlide}
              disabled={isAtEnd}
              className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200
                ${
                  isAtEnd
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <ChevronRight
                className={`w-5 h-5 ${
                  isAtEnd ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-4 cursor-grab active:cursor-grabbing"
            animate={controls}
            initial={{ x: 0 }}
            drag="x"
            dragControls={dragControls}
            dragConstraints={{
              left: -((categories.length - 2) * 50),
              right: 0,
            }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="min-w-[calc(50%-8px)]" // Exactly 2 slides with gap consideration
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
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
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {[...Array(categories.length - 1)].map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                controls.start({ x: `-${index * 50}%` });
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-black w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
