import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const MobileHeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { gender } = useAppContext();
  const videoRefs = useRef([]);
  const maleSlides = [
    {
      id: 1,
      type: "video",
      video: "https://res.cloudinary.com/di6unrpjw/video/upload/v1761165575/V3_egjbpb.mp4",
      title: "Timeless Attire",
      subtitle: "Curated styles for the season",
      cta: "Discover More",
      link: "tuxedo?sort=popularity",
    },
    {
      id: 2,
      type: "video",
      video: "https://res.cloudinary.com/di6unrpjw/video/upload/v1761165574/V2_c9vqud.mp4",
      title: "Tradition Tailored",
      subtitle: "Timeless wardrobe staples",
      cta: "View Collection",
      link: "kurta?sort=popularity",
    },
    {
      id: 3,
      type: "video",
      video: "https://res.cloudinary.com/di6unrpjw/video/upload/v1761165574/V1_w0zflf.mp4",
      title: "Modern Heritage",
      subtitle: "Explore our latest arrivals",
      cta: "Shop Now",
      link: "kurta?sort=popularity",
    },
  ];

  const femaleSlides = [
    {
      id: 4,
      type: "image",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/IMG_9666_1_j33uu0.webp",
      title: "Festive Vibes",
      subtitle: "Celebrate with grace",
      cta: "Explore Now",
      link: "",
    },
    {
      id: 5,
      type: "image",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/IMG_9657_1_sz78s0.webp",
      title: "Elegant Threads",
      subtitle: "Chic. Comfortable. Classy.",
      cta: "View Range",
      link: "",
    },
    {
      id: 6,
      type: "image",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/blue-frock_lhb0ge.webp",
      title: "Summer Breeze",
      subtitle: "Light looks for warm days",
      cta: "See Collection",
      link: "",
    },
  ];

  const slides = gender === "female" ? femaleSlides : maleSlides;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    
    // Manage video playback - pause all videos except the current one
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === newIndex && slides[index]?.type === "video") {
          video.play().catch(() => {
            // Autoplay might be prevented by browser policy
            console.log("Video autoplay prevented");
          });
        } else {
          video.pause();
        }
      }
    });
  }, [emblaApi, slides]);

  // Add visibility observer for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause all videos when page is not visible
        videoRefs.current.forEach(video => {
          if (video) video.pause();
        });
      } else {
        // Resume active video when page becomes visible
        const activeVideo = videoRefs.current[selectedIndex];
        if (activeVideo && slides[selectedIndex]?.type === "video") {
          activeVideo.play().catch(() => {
            console.log("Video resume prevented");
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedIndex, slides]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    // Auto-play
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    // Initial video setup
    if (slides[0]?.type === "video" && videoRefs.current[0]) {
      videoRefs.current[0].play().catch(() => {
        console.log("Initial video autoplay prevented");
      });
    }

    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(autoplayInterval);
    };
  }, [emblaApi, onSelect, slides]);

  return (
    <section className="w-full bg-transparent rounded-md">
      <div className="relative w-full h-[65vh] overflow-hidden" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative h-full transition-opacity duration-300"
            >
              <div className="relative w-full h-full">
                {slide.type === "video" ? (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={slide.video}
                    autoPlay={index === selectedIndex}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover object-center rounded-md"
                    style={{ objectPosition: "25% 75%" }}
                    onLoadedData={() => {
                      // Ensure the active video plays when loaded
                      if (index === selectedIndex && videoRefs.current[index]) {
                        videoRefs.current[index].play().catch(() => {
                          console.log("Video autoplay prevented");
                        });
                      }
                    }}
                    onError={() => {
                      console.warn("Video failed to load:", slide.video);
                    }}
                  />
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-[25%_75%] rounded-md"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-md" />
                <div className="absolute bottom-0 left-0 right-0 p-6 rounded-md">
                  <h2 className="text-3xl font-bold mb-2 text-white">
                    {slide.title}
                  </h2>
                  {/* <p className="text-base mb-4 text-gray-200">
                    {slide.subtitle}
                  </p> */}
                  <Link to={`/${slide.link}`}>
                    <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                      {slide.cta}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* <button
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
        </button> */}

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
