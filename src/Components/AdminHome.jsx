import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tiles = [
  {
    title: "Product Management",
    description: "Add, edit or delete products from different categories",
    route: "/admin/product",
  },
  {
    title: "Order Management",
    description: "View and manage customer orders efficiently",
    route: "/admin/orders",
  },
];

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.title}
              onClick={() => navigate(tile.route)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer bg-white rounded-2xl shadow-md p-6 hover:shadow-xl border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {tile.title}
              </h2>
              <p className="text-gray-500">{tile.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
