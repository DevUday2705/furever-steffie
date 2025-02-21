import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const WatchAndBuy = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState({});

  const products = [
    {
      id: 1,
      name: "Classic Black Tuxedo",
      price: 12999,
      video: "/videos/vid-1.mp4", // This would be your actual video path
    },
    {
      id: 2,
      name: "Royal Blue Sherwani",
      price: 15999,
      video: "/videos/vid-2.mp4",
    },
    {
      id: 3,
      name: "Designer Kurta Set",
      price: 8999,
      video: "/videos/vid-3.mp4",
    },
    {
      id: 4,
      name: "Silk Bandana Collection",
      price: 1499,
      video: "/videos/vid-4.mp4",
    },
  ];

  const videoRefs = useRef({});

  const handleVideoPlay = (productId) => {
    // Pause all other videos
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (parseInt(id) !== productId) {
        video.pause();
        setIsPlaying((prev) => ({ ...prev, [id]: false }));
      }
    });

    // Toggle current video
    if (videoRefs.current[productId].paused) {
      videoRefs.current[productId].play();
      setIsPlaying((prev) => ({ ...prev, [productId]: true }));
    } else {
      videoRefs.current[productId].pause();
      setIsPlaying((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const nextSlide = () => {
    if (currentIndex < products.length - 2) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= products.length - 2;
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Watch & Buy</h2>
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

        {/* Video Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{
              x: `-${currentIndex * 100}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="min-w-[300px] md:min-w-[350px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative group">
                  {/* Video Container */}
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-900">
                    <video
                      ref={(el) => (videoRefs.current[product.id] = el)}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      onClick={() => handleVideoPlay(product.id)}
                    >
                      <source src={product.video} type="video/mp4" />
                    </video>

                    {/* Play/Pause Button Overlay */}
                    <button
                      onClick={() => handleVideoPlay(product.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isPlaying[product.id] ? (
                        <Pause className="w-12 h-12 text-white" />
                      ) : (
                        <Play className="w-12 h-12 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WatchAndBuy;
