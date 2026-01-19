import React from "react";
import { ChevronLeft } from "lucide-react";

const ImageCarousel = ({
  images,
  selectedIndex,
  scrollTo,
  scrollSnaps,
  emblaRef,
  navigate,
}) => {
  // Function to check if the file is a video
  const isVideo = (url) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    const urlPath = url.toLowerCase();
    return videoExtensions.some(ext => urlPath.includes(ext));
  };

  const handleGoBack = () => navigate(-1);
  return (
    <>
      {/* Media Carousel with Back Button */}
      <div className="overflow-hidden relative" ref={emblaRef}>
        {/* Back Icon */}
        <button
          onClick={handleGoBack}
          className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors duration-200"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>
        <div className="flex">
          {images.map((media, idx) => (
            <div className="min-w-full relative pb-[133%]" key={idx}>
              {isVideo(media) ? (
                <video
                  src={media}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute w-full h-full object-cover object-[0%_25%]"
                />
              ) : (
                <img
                  src={media}
                  alt={`Product Media ${idx + 1}`}
                  className="absolute w-full h-full object-cover object-[0%_25%]"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Dots */}
      <div className="flex justify-center gap-x-2 py-3">
        {scrollSnaps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              selectedIndex === idx ? "bg-black w-4" : "bg-black/50"
            }`}
          />
        ))}
      </div>
    </>
  );
};

export default ImageCarousel;
