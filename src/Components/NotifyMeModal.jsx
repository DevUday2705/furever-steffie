import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, AlertCircle, CheckCircle, Package } from "lucide-react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

const NotifyMeModal = ({ isOpen, onClose, product }) => {
  const [email, setEmail] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !selectedSize) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Check if this email/product/size combination already exists
      const notificationRequestsRef = collection(db, "notificationRequests");
      const existingQuery = query(
        notificationRequestsRef,
        where("email", "==", email.toLowerCase()),
        where("productId", "==", product.id),
        where("size", "==", selectedSize)
      );

      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        toast.error(
          "You're already registered for notifications on this product and size!"
        );
        setIsLoading(false);
        return;
      }

      // Add new notification request
      await addDoc(notificationRequestsRef, {
        email: email.toLowerCase(),
        productId: product.id,
        productName: product.name,
        productImage: product.mainImage,
        productType: product.type,
        size: selectedSize,
        createdAt: new Date().toISOString(),
        notified: false,
        status: "pending",
      });

      setIsSubmitted(true);
      toast.success("You'll be notified when this item is back in stock!");

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setEmail("");
        setSelectedSize("");
      }, 2000);
    } catch (error) {
      console.error("Error saving notification request:", error);
      toast.error("Failed to save your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setIsSubmitted(false);
      setEmail("");
      setSelectedSize("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="relative bg-gray-800 text-white p-6 rounded-t-2xl">
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    <X size={24} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <Mail className="w-6 h-6 text-gray-200" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        Notify Me When Available
                      </h2>
                      <p className="text-gray-300 text-sm">
                        Get notified when this item is back in stock
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-100"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Currently sold out
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Size Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Size *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                            selectedSize === size
                              ? "bg-gray-800 text-white border-gray-800"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                          disabled={isLoading}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-800 mb-1">
                          Privacy Promise
                        </p>
                        <p>
                          We'll only use your email to notify you when this item
                          is back in stock. No spam or unwanted emails - we
                          promise!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !email || !selectedSize}
                    className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Notify Me When Available
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  You're All Set!
                </h3>
                <p className="text-gray-600 mb-4">
                  We'll send you an email as soon as{" "}
                  <strong>{product.name}</strong> in size{" "}
                  <strong>{selectedSize}</strong> is back in stock.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Package className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Notification registered successfully
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotifyMeModal;
