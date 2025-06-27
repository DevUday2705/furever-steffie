import React from "react";
import { motion } from "framer-motion";
import { Package, Wrench, Truck, CheckCircle } from "lucide-react";

const OrderProgressBar = ({ status }) => {
  const steps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "work-in-progress", label: "In Progress", icon: Wrench },
    { key: "ready-to-ship", label: "Ready to Ship", icon: Truck },
    { key: "shipped", label: "Shipped", icon: CheckCircle },
  ];

  const getStepIndex = (currentStatus) => {
    return steps.findIndex((step) => step.key === currentStatus);
  };

  const currentStepIndex = getStepIndex(status);

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Container for steps */}
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const IconComponent = step.icon;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center relative z-10"
              >
                {/* Step Circle */}
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-gray-600 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <IconComponent size={18} />
                </motion.div>

                {/* Step Label */}
                <p
                  className={`mt-3 text-sm font-medium text-center whitespace-nowrap ${
                    isCompleted ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Background Line - positioned absolutely to go through circles */}
        <div
          className="absolute top-6 bg-gray-200 h-0.5"
          style={{
            left: "24px", // Half of circle width (48px/2)
            right: "24px", // Half of circle width (48px/2)
          }}
        ></div>

        {/* Progress Line - animated based on status */}
        <motion.div
          className="absolute top-6 bg-gray-600 h-0.5"
          style={{
            left: "24px", // Half of circle width (48px/2)
          }}
          initial={{ width: "0%" }}
          animate={{
            width:
              currentStepIndex >= 0
                ? `calc(${
                    (currentStepIndex / (steps.length - 1)) * 100
                  }% - 48px + ${
                    (48 * currentStepIndex) / (steps.length - 1)
                  }px)`
                : "0%",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
export default OrderProgressBar;
