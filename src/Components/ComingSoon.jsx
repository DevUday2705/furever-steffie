import React from "react";
import { motion } from "framer-motion";

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-100 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full text-center bg-white/90 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-stone-200 p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img src="/images/logo.png" alt="Logo" className="h-14 object-contain" />
        </motion.div>

        <motion.div
          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Website Maintenance
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-slate-900 mt-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          We’re currently under maintenance
        </motion.h1>

        <motion.p
          className="text-slate-700 text-base sm:text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          We’re making a few improvements to serve you better. We should be live again by tomorrow, and we appreciate your patience while we wrap things up.
        </motion.p>

        <motion.div
          className="mt-8 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Please check back soon — we’ll be back online tomorrow.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoonPage;
