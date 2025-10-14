import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, CheckCircle, Clock, Users } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

const OrderPauseModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to Firebase
      await addDoc(collection(db, "order-resume-notifications"), {
        email: email.trim(),
        name: name.trim() || "Pet Parent",
        timestamp: new Date().toISOString(),
        status: "pending",
      });

      setIsSubmitted(true);
      toast.success("Thank you! We'll notify you first when orders resume 💕");
    } catch (error) {
      console.error("Error saving notification request:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form after a delay
      setTimeout(() => {
        setEmail("");
        setName("");
        setIsSubmitted(false);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl"
          >
            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 text-center border-b border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-rose-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Pawsome Response! 🐾
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We're overwhelmed by your love for furry fashion!
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* Status indicators */}
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800">
                          High Demand Alert
                        </p>
                        <p className="text-amber-700">
                          Processing orders takes 8-10 days currently
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">
                          Limited Workforce
                        </p>
                        <p className="text-blue-700">
                          Our small team is working around the clock
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      What's happening?
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your incredible support has led to more orders than our
                      tiny team can handle right now. We're taking a brief pause
                      to catch up and ensure every furry friend gets the perfect
                      fit they deserve! ✨
                    </p>
                  </div>

                  {/* Email collection form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Be the first to know when we're back! 💌
                      </label>
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium transition-all hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding you to the list...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Notify Me First!
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    We'll only use your email to notify you when orders resume.
                    No spam, we promise! 🤞
                  </p>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  You're on the VIP list! 🌟
                </h3>
                <p className="text-gray-600 mb-4">
                  Thank you {name || "so much"}! We'll send you an email the
                  moment we're ready to take new orders.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                  <p className="text-sm text-green-800 font-medium">
                    💝 You'll be among the first to know when we're back!
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Got it, thanks!
                </button>
              </div>
            )}

            {/* Close button */}
            {!isSubmitted && (
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderPauseModal;
