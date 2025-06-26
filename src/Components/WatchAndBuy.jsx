import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { convertCurrency } from "../constants/currency";
import { CurrencyContext } from "../context/currencyContext";

const WatchAndBuy = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isPlaying, setIsPlaying] = useState({});
  const videoRefs = useRef({});

  const products = [
    {
      id: 1,
      name: "Classic Black Tuxedo",
      price: 12999,
      video:
        "https://res.cloudinary.com/di6unrpjw/video/upload/v1745692424/vid-1_cndyer.mp4",
      link: "/product/sk001+kurta",
    },
    {
      id: 2,
      name: "Royal Blue Sherwani",
      link: "/product/sk002+kurta",
      price: 15999,
      video:
        "https://res.cloudinary.com/di6unrpjw/video/upload/v1745692423/vid-2_qabxnr.mp4",
    },
    {
      id: 3,
      name: "Designer Kurta Set",
      link: "/product/sk003+kurta",
      price: 8999,
      video:
        "https://res.cloudinary.com/di6unrpjw/video/upload/v1745692420/vid-4_dr6q2f.mp4",
    },
    {
      id: 4,
      name: "Silk Bandana Collection",
      link: "/product/sk004+kurta",
      price: 1499,
      video:
        "https://res.cloudinary.com/di6unrpjw/video/upload/v1745692420/vid-3_fimt2h.mp4",
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

  // Initialize videos
  useEffect(() => {
    products.forEach((product) => {
      if (videoRefs.current[product.id]) {
        videoRefs.current[product.id].play();
        setIsPlaying((prev) => ({ ...prev, [product.id]: true }));
      }
    });
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

  const { currency } = useContext(CurrencyContext);

  return (
    <section className="pb-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6 pt-5">
          <h2 className="text-2xl font-bold text-gray-900">Watch & Buy</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 
                ${
                  !canScrollPrev
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <ChevronLeft
                className={`w-4 h-4 ${
                  !canScrollPrev ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200
                ${
                  !canScrollNext
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <ChevronRight
                className={`w-4 h-4 ${
                  !canScrollNext ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Video Carousel */}
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] flex-grow-0 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link to={product.link}>
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
                        {convertCurrency(product.price, currency)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WatchAndBuy;
