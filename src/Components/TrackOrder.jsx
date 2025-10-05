import { useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatStatus } from "../constants/constant";
import OrderProgressBar from "./OrderProgressBar";

const TrackOrder = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Please enter an Order ID or Mobile Number");
      return;
    }

    setLoading(true);
    setError("");
    setOrders([]); // Clear previous results

    try {
      const orderDetails = await fetchOrderDetails(input.trim());
      setOrders(orderDetails);
      if (orderDetails.length === 0) {
        setError("No orders found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "Failed to fetch order details");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      console.log("Searching by Order Number:", orderId);

      // Query the orders collection where orderNumber field equals the orderId
      const q = query(
        collection(db, "orders"),
        where("orderNumber", "==", orderId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the first matching document
        const orderDoc = querySnapshot.docs[0];
        const orderData = {
          id: orderDoc.id,
          ...orderDoc.data(),
        };
        console.log("Found order by order number:", orderData);
        return orderData;
      } else {
        throw new Error("Order not found with this order number");
      }
    } catch (error) {
      console.error("Failed to fetch order by order number:", error);
      throw error;
    }
  };

  const fetchOrderByMobile = async (mobileNumber) => {
    try {
      console.log("Searching by Mobile Number:", mobileNumber);

      // Try different mobile number formats
      const mobileFormats = [
        mobileNumber,
        mobileNumber.replace(/\D/g, ""), // Remove all non-digits
        `+91${mobileNumber.replace(/\D/g, "")}`, // Add country code
        mobileNumber.replace(/\D/g, "").slice(-10), // Last 10 digits only
      ];

      for (const format of mobileFormats) {
        const q = query(
          collection(db, "orders"),
          where("customer.mobileNumber", "==", format)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orders = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Found orders by mobile:", orders);
          return orders;
        }
      }

      throw new Error("No orders found for this mobile number");
    } catch (error) {
      console.error("Failed to fetch orders by mobile:", error);
      throw error;
    }
  };

  const fetchOrderDetails = async (searchInput) => {
    try {
      // Clean the input
      const cleanInput = searchInput.trim();

      // Check if input looks like a phone number (contains mostly digits)
      const isPhoneNumber = /^\+?[\d\s\-\(\)]{8,15}$/.test(cleanInput);

      if (!isPhoneNumber) {
        // Try as Order ID first
        try {
          console.log("Trying as Order ID...");
          const order = await fetchOrderById(cleanInput);
          return [order];
        } catch (error) {
          console.log("Order ID search failed, trying as mobile...");
          // If Order ID fails, try as mobile number
          const orders = await fetchOrderByMobile(cleanInput);
          return orders;
        }
      } else {
        // Try as mobile number first
        try {
          console.log("Trying as Mobile Number...");
          const orders = await fetchOrderByMobile(cleanInput);
          return orders;
        } catch (error) {
          console.log("Mobile search failed, trying as Order ID...");
          // If mobile fails, try as Order ID
          const order = await fetchOrderById(cleanInput);
          return [order];
        }
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      throw new Error(
        "Order not found. Please check your Order ID or Mobile Number."
      );
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "ready-to-ship":
        return "text-purple-600 bg-purple-100";
      case "shipped":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-white px-4 py-12 flex flex-col justify-start items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
    >
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Track Your Order
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4 mb-8"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Order ID or Mobile Number"
          disabled={loading}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
        />

        {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Searching..." : "Track Order"}
        </motion.button>
      </form>

      {/* Display Orders */}
      {orders.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {orders.length > 1 ? "Your Orders" : "Order Details"}
          </h2>

          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on: {formatDate(order.createdAt || order.orderDate)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-white rounded-full text-xs font-medium  ${
                    order.orderStatus === "pending"
                      ? "bg-gray-400"
                      : order.orderStatus === "cutting"
                      ? "bg-yellow-500"
                      : order.orderStatus === "ready-to-ship"
                      ? "bg-indigo-500"
                      : order.orderStatus === "shipped"
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                >
                  {formatStatus(order.orderStatus) || "Pending"}
                </span>
              </div>

              <OrderProgressBar status={order.orderStatus} />

              {/* Shipping Information - Only show if order is shipped */}
              {order.orderStatus === "shipped" && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 text-green-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <h4 className="font-medium text-green-800">
                      Shipment Information
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    Your parcel has been handed over to our courier partner for
                    delivery.
                  </p>
                  <div className="text-sm text-green-700">
                    <p className="mb-1">
                      <span className="font-medium">Courier Service:</span>{" "}
                      Shree Maruti Courier Service
                    </p>
                    {order.tracking_id && (
                      <p className="mb-2">
                        <span className="font-medium">Tracking ID:</span>{" "}
                        {order.tracking_id}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Track your shipment:</span>{" "}
                      <a
                        href="https://www.shreemaruti.com/track-your-shipment/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline"
                      >
                        Visit Shree Maruti Tracking Portal
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              {order.customer && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Customer Details
                  </h4>
                  <p className="text-sm text-gray-600">
                    Name: {order.customer.fullName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Mobile: {order.customer.mobileNumber || "N/A"}
                  </p>
                  {order.customer.email && (
                    <p className="text-sm text-gray-600">
                      Email: {order.customer.email}
                    </p>
                  )}
                </div>
              )}

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-600 mb-1"
                    >
                      <span>{item.name || item.productName || "Item"}</span>
                      <span>Qty: {item.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Amount */}
              {order.total && (
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TrackOrder;
