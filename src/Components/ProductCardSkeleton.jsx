import { motion } from "framer-motion";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Image skeleton */}
      <div className="relative pb-[125%] overflow-hidden bg-gray-200">
        <div className="absolute w-full h-full">
          <motion.div
            className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Shimmer badges placeholders */}
        <div className="absolute top-2 right-2 w-16 h-5 bg-gray-300 rounded-bl-lg animate-pulse" />
        <div className="absolute bottom-2 left-2 w-12 h-4 bg-gray-300 rounded-tr-lg animate-pulse" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded-md animate-pulse" />
        
        {/* Price skeleton */}
        <div className="flex items-baseline space-x-2">
          <div className="h-5 w-16 bg-gray-300 rounded-md animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-4 w-10 bg-green-100 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;