/* eslint-disable react/prop-types */
import { Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PremiumSection = ({ products }) => {
  const safeProducts = products ?? [];
  const marqueeDuration = Math.max(18, (safeProducts.length || 1) * 4);

  if (!safeProducts.length) {
    return null;
  }

  const marqueeProducts = [...safeProducts, ...safeProducts];

  return (
    <section
      style={{ backgroundPosition: "0px -160px" }}
      className="py-8 bg-size-[100%_auto] bg-no-repeat bg-[url(/images/mandana.png)] overflow-x-hidden"
    >
      <style>{`
        @keyframes premium-marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .premium-marquee-track {
          animation: premium-marquee-scroll ${marqueeDuration}s linear infinite;
          will-change: transform;
        }
      `}</style>
      <div className="container mx-auto px-4">
        <div className="relative mb-2 text-center">
          <div className="flex items-center relative left-20 justify-center mb-1">
            <span className="relative text-[#cd9f4b] text-3xl font-mont uppercase tracking-wider font-black">
              <span className="shine-text block">Shaadi</span>
              <Crown className="absolute -left-[0.1rem] -top-4" size={20} />
            </span>
          </div>
          <h1 className="shine-text text-[#cd9f4b] font-mont font-semibold text-xs relative -top-4 left-22">
            COLLECTIONS
          </h1>
        </div>

        <div className="relative mb-4">
          <div className="relative overflow-hidden max-w-90 mx-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r  z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l  z-10" />
            <div className="premium-marquee-track flex w-max gap-4">
              {marqueeProducts.map((product, index) => {
                return (
                  <motion.div
                    key={`${product.id}-${index}`}
                    className="min-w-90 w-90 shrink-0 rounded-md p-2"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={`/product/${product.id}+${product.type}`}
                      className="block group"
                    >
                      <div className="relative rounded-lg overflow-hidden  shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="relative pb-[125%] overflow-hidden">
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="absolute rounded-lg top-0 left-0 w-full h-full object-cover "
                            loading="lazy"
                          />
                        </div>

                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
