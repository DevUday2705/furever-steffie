import React from "react";
import { motion } from "framer-motion";
const TrendingProducts = () => {
  const products = [
    {
      id: 1,
      name: "Classic Leather Jacket",
      price: 4999,
      image: "/images/1/1.jpg",
    },
    {
      id: 2,
      name: "Premium Denim Jeans",
      price: 2499,
      image: "/images/1/2.jpg",
    },
    {
      id: 3,
      name: "Cotton Casual Shirt",
      price: 1799,
      image: "/images/3/1.jpg",
    },
    {
      id: 4,
      name: "Designer Sunglasses",
      price: 999,
      image: "/images/4/1.jpg",
    },
    {
      id: 5,
      name: "Wool Blend Sweater",
      price: 2999,
      image: "/images/4/4.jpg",
    },
    {
      id: 6,
      name: "Canvas Sneakers",
      price: 1499,
      image: "/images/1/3.jpg",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
          <p className="mt-2 text-gray-600">Discover our most popular styles</p>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="group cursor-pointer"
              variants={item}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-lg overflow-hidden">
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-base sm:text-lg font-bold text-gray-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingProducts;
