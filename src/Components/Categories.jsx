import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const categoryGroups = [
  {
    id: 1,
    name: "TRADITIONAL",
    link: "traditional",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1773726481/IMG_2179_wmypnr.webp",
  },
  {
    id: 2,
    name: "FORMAL",
    link: "formal",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1778151677/IMG_3843_dqyl4d.webp",
  },
  {
    id: 3,
    name: "CASUAL",
    link: "casual",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    name: "ROYAL",
    link: "royal",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1760562224/Diwali_6_begntv.jpg",
  },
];

const Categories = () => {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {categoryGroups.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <Link to={`/${category.link}`} className="block relative group">
                <div className="relative h-[280px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img
                    loading="lazy"
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-2/4 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                </div>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-3 text-white flex flex-col transform group-hover:-translate-y-0.5 transition-transform duration-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-xl capitalize mb-1 flex items-center gap-1">
                    {category.name}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                      →
                    </span>
                  </h3>
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
