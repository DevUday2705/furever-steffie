import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
// For URL parameter extraction without useRouter

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("razorpay_order_id");
  const paymentId = searchParams.get("razorpay_payment_id");

  const [orderData, setOrderData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from localStorage
    try {
      const savedOrderData = localStorage.getItem("order");
      const savedCustomerData = localStorage.getItem("customer");

      if (savedOrderData && savedCustomerData) {
        setOrderData(JSON.parse(savedOrderData));
        setCustomerData(JSON.parse(savedCustomerData));
      }
    } catch (error) {
      console.error("Error retrieving data from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleContinueShopping = () => {
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!orderData || !customerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Order Information Not Found
          </h1>
          <p className="mb-6 text-gray-600 text-sm md:text-base">
            We couldn't retrieve your order information. Please contact customer
            support.
          </p>
          <button
            onClick={handleContinueShopping}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 inline-block"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-6 md:py-12 px-4"
    >
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Success Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-6 px-4 md:px-8 text-white text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-3"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </motion.div>
          <h1 className="text-xl md:text-2xl font-bold">
            Thank You For Your Order!
          </h1>
          <p className="text-indigo-100 text-sm md:text-base mt-1">
            Your payment was successful
          </p>
        </motion.div>

        {/* Order Receipt */}
        <div className="p-4 md:p-8">
          {/* Order Details */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Order Confirmation
                </h2>
                <p className="text-gray-600 text-sm">
                  Order ID:{" "}
                  <span className="font-medium">{orderId || "N/A"}</span>
                </p>
                <p className="text-gray-600 text-sm">
                  Date:{" "}
                  <span className="font-medium">{formatDate(new Date())}</span>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Payment Successful
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Payment ID: {paymentId || "N/A"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">
                Order Summary
              </h3>

              {/* Product Card (Mobile) */}
              <div className="md:hidden border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-16 w-16 rounded bg-gray-100 overflow-hidden">
                      {orderData.image && (
                        <img
                          src={orderData.image}
                          alt={orderData.name}
                          className="h-16 w-16 object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {orderData.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {orderData.subcategory}
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="text-xs text-gray-600">
                          Size: {orderData.selectedSize}
                          <div>
                            {orderData.isBeaded ? "Beaded" : "Not Beaded"} |
                            {orderData.isFullSet ? " Full Set" : " Single Item"}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          ₹{orderData.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{orderData.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Shipping</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{orderData.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 overflow-hidden">
                            {orderData.image && (
                              <img
                                src={orderData.image}
                                alt={orderData.name}
                                className="h-12 w-12 object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {orderData.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {orderData.subcategory}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          Size: {orderData.selectedSize}
                        </div>
                        <div className="text-sm text-gray-500">
                          {orderData.isBeaded ? "Beaded" : "Not Beaded"} |
                          {orderData.isFullSet ? " Full Set" : " Single Item"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        ₹{orderData.price.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-2 text-right text-sm font-medium text-gray-900"
                      >
                        Subtotal
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                        ₹{orderData.price.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-2 text-right text-sm font-medium text-gray-900"
                      >
                        Shipping
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                        ₹0
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-2 text-right text-sm font-bold text-gray-900"
                      >
                        Total
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">
                        ₹{orderData.price.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Customer and Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                Customer Information
              </h3>
              <p className="text-gray-700 font-medium">
                {customerData.fullName}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {customerData.mobileNumber}
              </p>
              {customerData.alternateMobile && (
                <p className="text-gray-600 text-sm">
                  Alt: {customerData.alternateMobile}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                Shipping Address
              </h3>
              <p className="text-gray-700 text-sm">
                {customerData.addressLine1}
              </p>
              <p className="text-gray-700 text-sm">
                {customerData.addressLine2}
              </p>
              <p className="text-gray-700 text-sm">
                {customerData.city}, {customerData.state} -{" "}
                {customerData.pincode}
              </p>
              <p className="text-gray-600 text-xs mt-2">
                <span className="font-medium">Delivery: </span>
                {customerData.deliveryOption === "standard"
                  ? "Standard Delivery"
                  : "Express Delivery"}
              </p>
              {customerData.specialInstructions &&
                customerData.specialInstructions !==
                  "No special instructions" && (
                  <p className="text-gray-600 text-xs mt-1">
                    <span className="font-medium">Instructions: </span>
                    {customerData.specialInstructions}
                  </p>
                )}
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-200 pt-6 text-center"
          >
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              We've sent a confirmation email with your order details.
              <br />
              Your order will be shipped soon.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleContinueShopping}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm md:text-base shadow-sm"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => window.print()}
                className="mt-3 sm:mt-0 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm md:text-base shadow-sm"
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    ></path>
                  </svg>
                  Print Receipt
                </span>
              </button>
            </div>
          </motion.div>

          {/* Support */}
          <div className="mt-8 text-center text-gray-500 text-xs md:text-sm">
            <p>Have questions about your order? Contact our support team:</p>
            <p className="font-medium">support@example.com | +91 98765 43210</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThankYouPage;
