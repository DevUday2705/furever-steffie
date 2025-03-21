import React, { useState } from "react";
import { motion } from "framer-motion";

const UPIPayment = ({
  orderTotal = 499,
  orderID = "12345",
  upiID = "importantphotos1998-2@okaxis",
  businessName = "Important Photos",
}) => {
  const [showQR, setShowQR] = useState(false);

  // Encode the parameters for the UPI deep link
  const encodedBusinessName = encodeURIComponent(businessName);
  const encodedNote = encodeURIComponent(`Order #${orderID}`);
  const simpleLink = `upi://pay?pa=${upiID}&pn=${encodedBusinessName}&am=1.00`;
  // Create UPI deep links for various apps
  const genericUpiLink = `upi://pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal.toFixed(
    2
  )}&cu=INR&tn=${encodedNote}`;
  const gpayLink = `gpay://upi/pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal.toFixed(
    2
  )}&cu=INR&tn=${encodedNote}`;
  const phonepeLink = `phonepe://pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal.toFixed(
    2
  )}&cu=INR&tn=${encodedNote}`;
  const paytmLink = `paytmapp://pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal.toFixed(
    2
  )}&cu=INR&tn=${encodedNote}`;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Example URL format for static UPI QR code
  const upiId = "importantphotos1998-2@okaxis";

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    businessName
  )}`;

  // You can use a free QR code generation API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    upiLink
  )}&size=200x200`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto my-4">
      <motion.div
        className="text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2
          className="text-xl font-bold text-gray-800 mb-2"
          variants={itemVariants}
        >
          Complete Your Payment
        </motion.h2>

        <motion.div
          className="text-sm text-gray-600 mb-4"
          variants={itemVariants}
        >
          Order #{orderID} • Total: ₹{orderTotal.toFixed(2)}
        </motion.div>

        <motion.div className="mb-6" variants={itemVariants}>
          <motion.button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center mb-3"
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = genericUpiLink)}
            variants={itemVariants}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Pay with Any UPI App
          </motion.button>
          <motion.button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-3"
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = simpleLink)}
            variants={itemVariants}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11 3a1 1 0 10-2 0v1.1A8.001 8.001 0 014.5 12a8 8 0 0011 7.5 1 1 0 00.5-1.9 6 6 0 100-12 1 1 0 00-.5-1.9V3z"
                clipRule="evenodd"
              />
            </svg>
            Test Payment (₹1)
          </motion.button>
          <div className="text-center text-sm text-gray-500 mb-3">
            - or pay using -
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <motion.a
              href={gpayLink}
              className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              <div className="w-10 h-10 bg-white rounded-full p-2 mb-1 flex items-center justify-center">
                <img src="/images/gpay.png" />
              </div>
              <span className="text-xs">Google Pay</span>
            </motion.a>

            <motion.a
              href={phonepeLink}
              className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              <div className="w-10 h-10 bg-white rounded-full p-2 mb-1 flex items-center justify-center">
                <img src="/images/phonepe.png" />
              </div>
              <span className="text-xs">PhonePe</span>
            </motion.a>

            <motion.a
              href={paytmLink}
              className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              <div className="w-10 h-10 bg-white rounded-full p-2 mb-1 flex items-center justify-center">
                <img src="/images/paytm.png" />
              </div>
              <span className="text-xs">Paytm</span>
            </motion.a>
          </div>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <motion.button
            className="text-purple-600 text-sm font-medium flex items-center justify-center mx-auto"
            onClick={() => setShowQR(!showQR)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showQR ? "Hide QR Code" : "Show QR Code"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 transform transition-transform ${
                showQR ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.button>

          <motion.div
            className="mt-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: showQR ? "auto" : 0,
              opacity: showQR ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {showQR && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="border p-2 rounded-lg mb-2"
                />
                <div className="text-sm text-gray-600 mb-2">
                  Scan with any UPI app
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded w-full text-center break-all">
                  UPI ID: {upiID}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UPIPayment;
