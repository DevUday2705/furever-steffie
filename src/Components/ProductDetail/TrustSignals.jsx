import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  Star,
  Award,
  Heart,
  ExternalLink,
} from "lucide-react";

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Size Exchange Guarantee",
      description: "Free size exchange if it doesn't fit your pet perfectly",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: RefreshCw,
      title: "7-Day Exchange Policy",
      description: "Hassle-free returns within 7 days of delivery",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Fast Shipping",
      description: "Replacement shipped within 3-5 business days",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Carefully inspected before every shipment",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const customerBenefits = [
    {
      icon: Heart,
      text: "Made with love for your furry friends",
    },
    {
      icon: Star,
      text: "Premium quality materials",
    },
    {
      icon: CheckCircle,
      text: "100% customer satisfaction focused",
    },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Trust Features Grid */}
      <div className="grid grid-cols-2 gap-3">
        {trustFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${feature.bg} rounded-lg p-3 border border-gray-100`}
            >
              <div className="flex items-start space-x-2">
                <Icon
                  className={`w-4 h-4 ${feature.color} mt-0.5 flex-shrink-0`}
                />
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Customer Benefits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-100"
      >
        <div className="space-y-2">
          {customerBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-center space-x-2">
                <Icon className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">
                  {benefit.text}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Policy Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-3 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-gray-800 mb-1">
              Exchange & Return Policy
            </h4>
            <p className="text-xs text-gray-600">
              Read our complete replacement policy and terms
            </p>
          </div>
          <Link
            to="/terms#replacement"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="text-xs font-medium">View Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* Return Shipping Notice */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-amber-50 rounded-lg p-3 border border-amber-200"
      >
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
          <div>
            <p className="text-xs text-amber-800 font-medium mb-1">
              Return Shipping Notice
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Customer covers return shipping costs. We recommend trackable
              shipping for your protection.
            </p>
          </div>
        </div>
      </motion.div> */}

      {/* Measurement Reminder */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-blue-50 rounded-lg p-3 border border-blue-200"
      >
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-800 font-medium mb-1">
              📏 Measurement Required
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Please share your pet&apos;s measurements within 24 hours of
              ordering for perfect fit!
            </p>
          </div>
        </div>
      </motion.div> */}
    </div>
  );
};

export default TrustSignals;
