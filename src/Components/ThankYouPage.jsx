import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";

const ThankYouPage = () => {
  const router = useRouter();
  const { orderId, paymentId } = router.query;

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!orderData || !customerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">
            Order Information Not Found
          </h1>
          <p className="mb-6 text-gray-600">
            We couldn't retrieve your order information. Please contact customer
            support.
          </p>
          <Link href="/">
            <a className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 inline-block">
              Return to Homepage
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12 px-4"
    >
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 py-6 px-8 text-white text-center">
          <div className="text-4xl mb-2">✓</div>
          <h1 className="text-2xl font-bold">Thank You For Your Order!</h1>
          <p className="text-indigo-100">Your payment was successful</p>
        </div>

        {/* Order Receipt */}
        <div className="p-6 md:p-8">
          {/* Order Details */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Order Confirmation
                </h2>
                <p className="text-gray-600">Order ID: {orderId || "N/A"}</p>
                <p className="text-gray-600">Date: {formatDate(new Date())}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-sm font-medium inline-block">
                  Payment Successful
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Payment ID: {paymentId || "N/A"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Order Summary
              </h3>
              <div className="border rounded-lg overflow-hidden">
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
                        className="px-4 py-3 text-right text-sm font-medium text-gray-900"
                      >
                        Subtotal
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{orderData.price.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-3 text-right text-sm font-medium text-gray-900"
                      >
                        Shipping
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹0
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-3 text-right text-sm font-bold text-gray-900"
                      >
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        ₹{orderData.price.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Customer and Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Customer Information
              </h3>
              <p className="text-gray-700">{customerData.fullName}</p>
              <p className="text-gray-600">{customerData.mobileNumber}</p>
              {customerData.alternateMobile && (
                <p className="text-gray-600">
                  Alt: {customerData.alternateMobile}
                </p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Shipping Address
              </h3>
              <p className="text-gray-700">{customerData.addressLine1}</p>
              <p className="text-gray-700">{customerData.addressLine2}</p>
              <p className="text-gray-700">
                {customerData.city}, {customerData.state} -{" "}
                {customerData.pincode}
              </p>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Delivery: </span>
                {customerData.deliveryOption === "standard"
                  ? "Standard Delivery"
                  : "Express Delivery"}
              </p>
              {customerData.specialInstructions &&
                customerData.specialInstructions !==
                  "No special instructions" && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Instructions: </span>
                    {customerData.specialInstructions}
                  </p>
                )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-gray-600 mb-6">
              We've sent a confirmation email with your order details.
              <br />
              Your order will be shipped soon.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <a className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                  Continue Shopping
                </a>
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
              >
                Print Receipt
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Have questions about your order? Contact our support team:</p>
            <p className="font-medium">support@example.com | +91 98765 43210</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThankYouPage;
