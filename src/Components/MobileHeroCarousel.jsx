import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const MobileHeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

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
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    // Auto-play
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(autoplayInterval);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full bg-gray-900 rounded-md">
      <div className="relative w-full h-[60vh] overflow-hidden" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative h-full transition-opacity duration-300"
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-md" />
                <div className="absolute bottom-0 left-0 right-0 p-6 rounded-md">
                  <h2 className="text-3xl font-bold mb-2 text-white">
                    {slide.title}
                  </h2>
                  <p className="text-base mb-4 text-gray-200">
                    {slide.subtitle}
                  </p>
                  <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-10"
          onClick={scrollPrev}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-10"
          onClick={scrollNext}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileHeroCarousel;
