// Updated Categories Component with 2-Column Grid
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Categories = () => {
  const { gender, setGender } = useAppContext();

  const maleCategories = [
    {
      id: 1,
      name: "KURTA",
      link: "kurta",
      description: "Contemporary Styles",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1753112945/Rani_Pink_nqcsl7.webp  ",
    },
    {
      id: 2,
      name: "TUXEDO",
      link: "tuxedo",
      description: "Classic Fits",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1752523140/Luxury_black_Blazer_Sets_for_Pets_w0jku9.webp",
    },
    {
      id: 3,
      name: "BANDANAS",
      link: "Male Bandanas",
      description: "Trendy Accessories",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1755713280/IMG_9469_txpsl9.webp",
    },
    {
      id: 4,
      name: "BOW TIE",
      link: "Bow Tie",
      description: "Suit Up!",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/f_auto,q_auto,w_600/v1744099695/ChatGPT_Image_Apr_8_2025_01_37_49_PM_mqrwhi.png",
    },
  ];

  const femaleCategories = [
    {
      id: 7,
      name: "Frock",
      link: "Frock",
      description: "Playful Frills",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/cherry_red_polka_dot_frock_d3cspz.webp",
    },
    {
      id: 6,
      name: "Tutu Dress",
      link: "Tutu Dress",
      description: "Traditional Elegance",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/White_Whisper_with_Bow_dce8nr.webp",
    },
    {
      id: 8,
      name: "Bandanas",
      link: "Female Bandanas",
      description: "Trendy Accessories",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1745436600/ChatGPT_Image_Apr_24_2025_12_54_24_AM_1_siiyl6.png",
    },
    {
      id: 9,
      link: "Bow Tie",
      name: "Bow Tie",
      description: "Cute Touch",
      image:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913361/ChatGPT_Image_Apr_17_2025_01_02_11_AM_sp7jye.png",
    },
  ];

  const categories = gender === "male" ? maleCategories : femaleCategories;

  const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Toggle Switch */}

        <div className="flex mx-10 justify-center gap-4 mb-8">
          {["male", "female"].map((type) => (
            <button
              key={type}
              onClick={() => setGender(type)}
              className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 border relative overflow-hidden
      ${
        gender === type
          ? "bg-black text-white border-black scale-105 shadow-lg"
          : "bg-white text-black border-gray-300 hover:border-black hover:shadow-md"
      }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}

              {/* Shimmer effect for selected button */}
              {gender === type && (
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              )}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Shop by Category
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <Link
                to={`/${generateSlug(category.link)}?sort=popularity`}
                className="block relative group"
              >
                <div className="relative h-[280px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img
                    loading="lazy"
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-3 text-white flex flex-col transform group-hover:translate-y-[-2px] transition-transform duration-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-xl capitalize  mb-1 flex items-center gap-1">
                    {category.name}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                      →
                    </span>
                  </h3>
                  {/* <p className="text-gray-200 text-xs font-medium">
                    {category.description}
                  </p> */}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
