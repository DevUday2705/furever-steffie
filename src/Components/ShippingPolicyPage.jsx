import React, { useContext } from "react";
import { motion } from "framer-motion";
import { Truck, Clock, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { convertCurrency } from "../constants/currency";
import { CurrencyContext } from "../context/currencyContext";

export default function ShippingPolicyPage() {
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

  const { currency } = useContext(CurrencyContext);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Shipping Policy
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about our shipping options
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Hero section */}
          <div className="bg-blue-600 text-white p-8">
            <motion.div
              variants={itemVariants}
              className="flex items-center mb-4"
            >
              <Truck className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold">Our Delivery Promise</h2>
            </motion.div>
            <motion.p variants={itemVariants} className="text-blue-100">
              We're committed to getting your orders to you as quickly and
              efficiently as possible. Please review our shipping options and
              policies below.
            </motion.p>
          </div>

          {/* Main content */}
          <div className="p-8">
            <motion.div variants={itemVariants} className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Delivery Timeframes
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                <p className="text-gray-700 mb-4">
                  Standard shipping typically delivers your order within{" "}
                  <strong>5-7 working days</strong>. However, please note that
                  in some cases, delivery may take up to{" "}
                  <strong>10 working days</strong>
                  depending on your location and other external factors.
                </p>
                <div className="flex items-start text-gray-600 text-sm mt-2">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Working days are Monday through Friday, excluding public
                    holidays.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                Shipping Options
              </h3>
              <div className="grid md:grid-cols-1 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-800">
                      Standard Delivery
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {convertCurrency(50, currency)}
                    </span>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>5-7 working days delivery</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>Order tracking provided</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-amber-500" />
                      <span>May take up to 10 days in some cases</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-800">
                      Express Delivery
                    </h4>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                      {convertCurrency(200, currency)}
                    </span>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>Guaranteed delivery within 2 days</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>Priority handling</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>Real-time tracking updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Additional Information
              </h3>
              <div className="space-y-4 text-gray-700">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Order Processing
                  </h4>
                  <p>
                    All orders are processed within 24 hours of being placed.
                    Orders placed after 2 PM IST may be processed the following
                    business day.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Shipping Calculations
                  </h4>
                  <p>
                    Shipping charges are calculated at checkout based on your
                    selected delivery method. The charges shown are inclusive of
                    all taxes and handling fees.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Delivery Confirmation
                  </h4>
                  <p>
                    You will receive a confirmation email with tracking
                    information once your order has been shipped. You can use
                    this to track your package throughout the delivery process.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            variants={itemVariants}
            className="border-t border-gray-200 p-8 bg-gray-50"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              <details className="bg-white p-4 rounded-lg shadow-sm">
                <summary className="font-medium text-gray-800 cursor-pointer">
                  What if my order is delayed?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  If your order hasn't arrived within the expected timeframe,
                  please contact our customer service team with your order
                  number for assistance.
                </p>
              </details>

              <details className="bg-white p-4 rounded-lg shadow-sm">
                <summary className="font-medium text-gray-800 cursor-pointer">
                  Can I change my shipping option after placing an order?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Shipping options can only be changed within 1 hour of placing
                  your order. Please contact customer service immediately if you
                  need to make changes.
                </p>
              </details>

              <details className="bg-white p-4 rounded-lg shadow-sm">
                <summary className="font-medium text-gray-800 cursor-pointer">
                  Do you ship on weekends?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Orders are processed and shipped Monday through Friday. Orders
                  placed on weekends will be processed on the next business day.
                </p>
              </details>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-center text-gray-600 text-sm"
        >
          <p>This shipping policy was last updated on April 8, 2025.</p>
          <p className="mt-2">
            If you have any questions about our shipping policy, please{" "}
            <a href="/contact" className="text-blue-600 hover:underline">
              contact us
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
