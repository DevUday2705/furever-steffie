import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const WatchAndBuy = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState({});
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const dragX = useMotionValue(0);

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
  const containerRef = useRef(null);
  const carouselRef = useRef(null);

  // Calculate drag constraints based on container and carousel width
  const updateConstraints = () => {
    if (containerRef.current && carouselRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const carouselWidth = carouselRef.current.scrollWidth;
      const maxDrag = containerWidth - carouselWidth;

      setConstraints({
        left: Math.min(maxDrag, 0), // Ensure we don't allow drag if content fits
        right: 0,
      });

      // Reset position if we're beyond the new constraints
      if (currentIndex > products.length - Math.floor(containerWidth / 200)) {
        setCurrentIndex(
          Math.max(0, products.length - Math.floor(containerWidth / 200))
        );
      }
    }
  };

  useEffect(() => {
    // Initialize videos
    products.forEach((product) => {
      if (videoRefs.current[product.id]) {
        videoRefs.current[product.id].play();
        setIsPlaying((prev) => ({ ...prev, [product.id]: true }));
      }
    });

    // Initial constraint calculation
    updateConstraints();

    // Update constraints on resize
    const handleResize = () => {
      updateConstraints();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVideoPlay = (productId) => {
    if (videoRefs.current[productId].paused) {
      videoRefs.current[productId].play();
      setIsPlaying((prev) => ({ ...prev, [productId]: true }));
    } else {
      videoRefs.current[productId].pause();
      setIsPlaying((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const nextSlide = () => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const visibleItems = Math.floor(containerWidth / 200); // Approximate item width
    const maxIndex = Math.max(0, products.length - visibleItems);

    if (currentIndex < maxIndex) {
      setCurrentIndex(Math.min(currentIndex + 1, maxIndex));
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDragEnd = (_, info) => {
    const threshold = 50;
    if (Math.abs(info.velocity.x) > threshold) {
      if (info.velocity.x > 0 && currentIndex > 0) {
        prevSlide();
      } else if (info.velocity.x < 0 && currentIndex < products.length - 2) {
        nextSlide();
      }
    }
  };

  const containerWidth = containerRef.current?.offsetWidth || 0;
  const visibleItems = Math.floor(containerWidth / 200);
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= Math.max(0, products.length - visibleItems);
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4" ref={containerRef}>
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Watch & Buy</h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={isAtStart}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 
            ${
              isAtStart
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:bg-gray-50 cursor-pointer"
            }`}
            >
              <ChevronLeft
                className={`w-4 h-4 ${
                  isAtStart ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
            <button
              onClick={nextSlide}
              disabled={isAtEnd}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200
            ${
              isAtEnd
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:bg-gray-50 cursor-pointer"
            }`}
            >
              <ChevronRight
                className={`w-4 h-4 ${
                  isAtEnd ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Video Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            ref={carouselRef}
            className="flex gap-3"
            style={{ x: dragX }}
            drag="x"
            dragConstraints={constraints}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={{
              x: `-${currentIndex * (containerWidth / visibleItems)}px`,
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
                className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative group">
                  {/* Video Container with 9:16 aspect ratio */}
                  <div className="relative w-full pt-[177.78%] rounded-lg overflow-hidden bg-gray-900">
                    <video
                      ref={(el) => (videoRefs.current[product.id] = el)}
                      className="absolute top-0 left-0 w-full h-full object-cover"
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
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="mt-3">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">
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
