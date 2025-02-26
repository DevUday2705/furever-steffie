import React, { useState } from "react";
import { motion } from "framer-motion";

const UPIPayment = ({
  orderTotal = 499,
  orderID = "12345",
  upiID = "importantphotos1998-2@okaxis",
  businessName = "DogFashionIndia",
}) => {
  const [showQR, setShowQR] = useState(false);

  // Encode the parameters for the UPI deep link
  const encodedBusinessName = encodeURIComponent(businessName);
  const encodedNote = encodeURIComponent(`Order #${orderID}`);

  // Create UPI deep links for various apps
  const genericUpiLink = `upi://pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal}&cu=INR&tn=${encodedNote}`;
  const gpayLink = `gpay://upi/pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal}&cu=INR&tn=${encodedNote}`;
  const phonepeLink = `phonepe://pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal}&cu=INR&tn=${encodedNote}`;
  const paytmLink = `paytmapp://pay?pa=${upiID}&pn=${encodedBusinessName}&am=${orderTotal}&cu=INR&tn=${encodedNote}`;

  // QR code URL (using a public QR code generation API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    genericUpiLink
  )}&size=200x200`;

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                >
                  <path
                    fill="#CFD8DC"
                    d="M35,44H13c-2.2,0-4-1.8-4-4V8c0-2.2,1.8-4,4-4h22c2.2,0,4,1.8,4,4v32C39,42.2,37.2,44,35,44z"
                  />
                  <path
                    fill="#F5F5F5"
                    d="M35,42H13c-1.1,0-2-0.9-2-2V8c0-1.1,0.9-2,2-2h22c1.1,0,2,0.9,2,2v32C37,41.1,36.1,42,35,42z"
                  />
                  <path fill="#3F51B5" d="M18,17h12v2H18V17z" />
                  <path
                    fill="#00BCD4"
                    d="M23.8,26.6l-5.4-3.1c-0.2-0.1-0.5-0.1-0.7,0.2c-0.2,0.2-0.1,0.5,0.1,0.7l5.4,3.1c0.1,0.1,0.2,0.1,0.3,0.1c0.2,0,0.3-0.1,0.4-0.2C24.1,27.1,24,26.7,23.8,26.6z"
                  />
                  <path
                    fill="#7986CB"
                    d="M23.5,19.1L18.1,16c-0.2-0.1-0.5-0.1-0.7,0.2c-0.1,0.2-0.1,0.5,0.2,0.7l5.4,3.1c0.1,0.1,0.2,0.1,0.3,0.1c0.2,0,0.3-0.1,0.4-0.2C24,19.6,23.9,19.3,23.5,19.1z"
                  />
                  <path
                    fill="#F44336"
                    d="M29.4,16.3l-5.5-3.1c-0.2-0.1-0.5,0-0.7,0.2c-0.1,0.2,0,0.5,0.2,0.7l5.5,3.1c0.1,0.1,0.2,0.1,0.3,0.1c0.2,0,0.3-0.1,0.4-0.3C29.7,16.7,29.6,16.4,29.4,16.3z"
                  />
                  <path
                    fill="#009688"
                    d="M24.1,27.5L24.1,27.5c-0.2-0.4-0.7-0.5-1-0.3l0,0c-0.4,0.2-0.5,0.7-0.3,1l0,0c0.2,0.3,0.7,0.5,1,0.3l0,0C24.2,28.3,24.3,27.8,24.1,27.5z"
                  />
                  <path
                    fill="#009688"
                    d="M25.3,24.9L25.3,24.9c-0.2-0.4-0.7-0.5-1-0.3l0,0c-0.4,0.2-0.5,0.7-0.3,1l0,0c0.2,0.3,0.7,0.5,1,0.3l0,0C25.4,25.7,25.5,25.2,25.3,24.9z"
                  />
                  <path
                    fill="#009688"
                    d="M26.5,22.3L26.5,22.3c-0.2-0.4-0.7-0.5-1-0.3l0,0c-0.4,0.2-0.5,0.7-0.3,1l0,0c0.2,0.3,0.7,0.5,1,0.3l0,0C26.6,23.1,26.7,22.6,26.5,22.3z"
                  />
                  <path
                    fill="#009688"
                    d="M27.7,19.7L27.7,19.7c-0.2-0.4-0.7-0.5-1-0.3l0,0c-0.4,0.2-0.5,0.7-0.3,1l0,0c0.2,0.3,0.7,0.5,1,0.3l0,0C27.8,20.5,27.9,20,27.7,19.7z"
                  />
                  <path
                    fill="#009688"
                    d="M29,17.1L29,17.1c-0.2-0.4-0.7-0.5-1-0.3l0,0c-0.4,0.2-0.5,0.7-0.3,1l0,0c0.2,0.3,0.7,0.5,1,0.3l0,0C29,17.9,29.1,17.4,29,17.1z"
                  />
                  <path
                    fill="#009688"
                    d="M30.2,14.5L30.2,14.5c-0.2-0.4-0.7-0.5-1-0.3l0,0c-0.4,0.2-0.5,0.7-0.3,1l0,0c0.2,0.3,0.7,0.5,1,0.3l0,0C30.2,15.3,30.3,14.8,30.2,14.5z"
                  />
                </svg>
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
              <div className="w-10 h-10 bg-purple-100 rounded-full p-2 mb-1 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 124 124"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M61.8501 0C27.8249 0 0 27.8249 0 61.8501C0 95.8752 27.8249 124 61.8501 124C95.8752 124 124 95.8752 124 61.8501C124 27.8249 95.8752 0 61.8501 0Z"
                    fill="#5F259F"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M52.4335 46.4508L52.4139 84.6496H62.3242V65.1252H71.1068C80.9936 65.1252 89.5245 58.0645 89.5245 46.4508H52.4335ZM71.1068 55.8337H62.3242V55.7624H62.1382V46.4508H79.7086C79.7093 54.2142 75.9543 55.8337 71.1068 55.8337Z"
                    fill="white"
                  />
                  <path
                    d="M43.6016 27.4951V97.8683L34.0765 97.8683L34.0765 27.4951H43.6016Z"
                    fill="white"
                  />
                </svg>
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
              <div className="w-10 h-10 bg-blue-50 rounded-full p-2 mb-1 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23.1556 6.7417C22.7078 4.38727 20.5806 2.73307 18.158 2.73307H5.82002C3.38244 2.73307 1.2603 4.40312 0.813306 6.7417C0.382756 8.98935 0.0639844 11.4692 0.0120351 13.9331C0.00401169 14.2083 0 14.4834 0 14.7636C0 16.3919 0.0827089 18.0203 0.244542 19.6003C0.60264 23.0526 3.52437 23.9997 5.85936 23.9997H18.14C20.4909 23.9997 23.3973 23.0526 23.7554 19.6C23.917 18.0201 24 16.392 24 14.7639C24 14.4834 23.996 14.2083 23.988 13.9331C23.936 11.4695 23.6172 8.98956 23.1554 6.7417H23.1556ZM16.8 13.4412H13.8001V16.4434H10.7998V13.4412H7.79989V10.4391H10.7998V7.43689H13.8001V10.4391H16.8V13.4412Z"
                    fill="#00BAF2"
                  />
                </svg>
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
                  src="/api/placeholder/200/200"
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
