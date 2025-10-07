import { motion } from "framer-motion";
import {
  Shield,
  RefreshCw,
  Clock,
  Award,
} from "lucide-react";

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Size Exchange Guarantee",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: RefreshCw,
      title: "7-Day Exchange Policy",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Fast Shipping",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: Award,
      title: "Quality Assured",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="px-4 py-2">
      {/* Compact Trust Features Grid */}
      <div className="grid grid-cols-4 gap-2">
        {trustFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex flex-col items-center justify-center ${feature.bg} rounded-lg p-2 border border-gray-100`}
            >
              <Icon className={`w-5 h-5 ${feature.color} mb-1`} />
              <span className="text-[11px] font-semibold text-gray-800 text-center leading-tight">
                {feature.title}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustSignals;
