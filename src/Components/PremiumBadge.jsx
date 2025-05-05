// PremiumBadge.jsx
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const PremiumBadge = () => {
  return (
    <div
      className="relative inline-flex items-center overflow-hidden px-2.5 py-1 rounded-full text-xs font-semibold text-white"
      style={{
        background: "linear-gradient(90deg, #c9a94e, #b5892e)",
        boxShadow: "0 2px 6px rgba(201, 169, 78, 0.35)",
      }}
    >
      <Crown size={12} className="mr-1 text-white opacity-90" />
      ROYAL
      {/* Animated Shine */}
      <motion.div
        className="absolute left-[-30%] top-0 w-[60%] h-full bg-white opacity-10 rotate-60"
        animate={{ left: "130%" }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
};

export default PremiumBadge;
