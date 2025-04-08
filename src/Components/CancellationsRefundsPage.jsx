import React from "react";
import { motion } from "framer-motion";
import { ShieldX, AlertCircle, Ruler, PawPrint, Scissors } from "lucide-react";

export default function CancellationsRefundsPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Cancellations & Refunds
          </h1>
          <p className="text-gray-600">Our policy on orders and returns</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Hero banner */}
          <div className="bg-red-600 px-6 py-8 text-white">
            <motion.div
              variants={itemVariants}
              className="flex items-center mb-4"
            >
              <ShieldX className="w-8 h-8 mr-3" />
              <h2 className="text-xl font-semibold">
                No Cancellations or Refunds
              </h2>
            </motion.div>
            <motion.p variants={itemVariants} className="text-red-100">
              Please note that we cannot process cancellations or provide
              refunds after payment has been made.
            </motion.p>
          </div>

          {/* Main content */}
          <div className="p-6">
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center mb-4">
                <Scissors className="w-6 h-6 mr-2 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Custom-Made Products
                </h3>
              </div>
              <p className="text-gray-700 mb-4">
                Each garment is custom-made according to your pet's specific
                measurements:
              </p>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                    <Ruler className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-gray-600">Chest size</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                    <Ruler className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-gray-600">Neck measurements</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                    <Ruler className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-gray-600">Length requirements</p>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center mb-4">
                <PawPrint className="w-6 h-6 mr-2 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Pet Safety Concerns
                </h3>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-gray-700">
                  Dogs are prone to ticks and other parasites. For hygiene and
                  safety reasons, we cannot accept returns or provide
                  replacements for clothing items that have been worn by pets.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Important Notes
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                    <span className="block w-4 h-4 text-red-600 font-bold text-center text-xs">
                      1
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Please ensure that you provide accurate measurements before
                    placing your order.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                    <span className="block w-4 h-4 text-red-600 font-bold text-center text-xs">
                      2
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Double-check all details in your order summary before
                    completing payment.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                    <span className="block w-4 h-4 text-red-600 font-bold text-center text-xs">
                      3
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Once payment is processed, your custom order will be created
                    specifically for your pet.
                  </p>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="border-t border-gray-200 pt-6"
            >
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Questions?</h4>
                <p className="text-gray-600 text-sm">
                  If you have any questions about our no-refund policy or need
                  assistance with measurements, please contact our customer
                  service team before placing your order.
                </p>
                <div className="mt-4 flex items-center">
                  <a
                    href="/contact"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Contact Us →
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-center text-gray-500 text-xs"
        >
          <p>Policy last updated: April 8, 2025</p>
        </motion.div>
      </div>
    </div>
  );
}
