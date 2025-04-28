import React from "react";

const ImageCarousel = ({
  images,
  selectedIndex,
  scrollTo,
  scrollSnaps,
  emblaRef,
}) => {
  return (
    <>
      {/* Image Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((img, idx) => (
            <div className="min-w-full relative pb-[133%]" key={idx}>
              <img
                src={img}
                alt={`Product Image ${idx + 1}`}
                className="absolute w-full h-full object-cover object-[0%_25%]"
              />
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
