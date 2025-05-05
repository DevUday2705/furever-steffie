import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, CrownIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { kurtas } from "../constants/constant";

// Assuming you pass this prop or import directly
// adjust path as needed

const PremiumSectionCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 2,
  });

  const premiumProducts = kurtas.filter((item) => item.category === "premium");

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
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

  const calculatePrice = (product) => {
    const base = product.pricing.basePrice;
    const discount = product.pricing.discountPercent;
    return discount > 0 ? Math.round(base * (1 - discount / 100)) : base;
  };

  return (
    <section className="bg-black relative rounded-b-2xl pt-10 pb-5 text-white">
      <div className="flex absolute bg-black px-5 py-2 rounded-t-xl -top-10 text-white items-center gap-x-5">
        <CrownIcon /> ROYAL
      </div>
      <div className="container mx-auto px-4">
        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {premiumProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="min-w-[calc(50%-12px)] rounded-2xl flex-shrink-0  overflow-hidden "
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="h-[320px] rounded-2xl w-full relative">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full rounded-b-2xl h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold ">{product.name}</h3>
                    <p className="mt-1 text-white font-medium text-lg">
                      ₹{calculatePrice(product)}
                    </p>
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

export default PremiumSectionCarousel;
