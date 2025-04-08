import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import domtoimage from "dom-to-image";

import {
  ChevronLeft,
  Check,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle,
  CreditCard,
  Building,
  Copy,
  AlertCircle,
  User,
  Info,
  Smartphone,
  MessageCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { toPng } from "html-to-image";
import { AnimatePresence, motion } from "framer-motion";
import { QRCode } from "react-qrcode-logo";
import toast from "react-hot-toast";
import { validateForm } from "../constants/constant";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails, sizeConfirmed } = location.state || {};
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    mobileNumber: "",
    alternateMobile: "",
    specialInstructions: "",
    deliveryOption: "standard",
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  // Order complete state
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Calculate total price including delivery
  const calculateTotal = () => {
    if (!orderDetails) return 0;
    let total = orderDetails.price;

    // Add delivery charge
    total += formData.deliveryOption === "express" ? 399 : 49;

    return total;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (validateForm(formData, setErrors)) {
      // In a real app, this would submit the order to a backend
      handlePayment();
    }
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Download receipt as image

  // If no order details, redirect back
  if (!orderDetails && !orderCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Order Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please start your order from the product page.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-800 text-white rounded-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 499 }), // in INR
    });

    const data = await res.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // from .env file
      amount: data.amount, // in paise
      currency: data.currency,
      name: "Furever Steffie",
      description: "Order Payment",
      order_id: data.id,
      handler: function (response) {
        alert("Payment successful!");
        console.log(response);
        // call API to verify or confirm order here
      },
      prefill: {
        name: formData?.fullName,
        contact: formData?.mobileNumber,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="bg-gray-50 pb-24">
      {/* Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-3">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-600"
          >
            <ChevronLeft size={18} />
            <span className="ml-1 text-sm">Back</span>
          </button>
        </div>
      </div>

      <div className="container max-w-md mx-auto pt-4 pb-16">
        {!orderCompleted ? (
          <form onSubmit={handleSubmit}>
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-md font-semibold text-gray-800">
                  Order Summary
                </h3>
              </div>

              <div className="p-4">
                <div className="flex mb-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={orderDetails?.image}
                      alt={orderDetails?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-xs font-medium text-gray-600">
                      {orderDetails?.subcategory}
                    </div>
                    <h4 className="text-md font-semibold text-gray-800">
                      {orderDetails?.name}
                    </h4>
                    <div className="mt-1 text-sm text-gray-600">
                      {orderDetails?.isBeaded ? "Hand Work" : "Simple"} •{" "}
                      {orderDetails?.isFullSet ? "Full Set" : "Kurta Only"} •
                      Size {orderDetails?.selectedSize}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-md font-semibold text-gray-800">
                  Shipping Information
                </h3>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1*
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.addressLine1 ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder="House/Flat number, Building name"
                  />
                  {errors.addressLine1 && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Street name, Area (Optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      } rounded-md text-sm`}
                      placeholder="City"
                    />
                    {errors.city && formSubmitted && (
                      <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State*
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      } rounded-md text-sm`}
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      {/* Add other Indian states */}
                    </select>
                    {errors.state && formSubmitted && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    PIN Code*
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full p-2 border ${
                      errors.pincode ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder="6-digit PIN code"
                  />
                  {errors.pincode && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.pincode}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile Number*
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full p-2 border ${
                      errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobileNumber && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="alternateMobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alternate Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="alternateMobile"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full p-2 border ${
                      errors.alternateMobile
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder="Alternate number (Optional)"
                  />
                  {errors.alternateMobile && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.alternateMobile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-md font-semibold text-gray-800">
                  Delivery Options
                </h3>
              </div>

              <div className="p-4">
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5 text-gray-800">
                      <AlertTriangle size={16} className="text-yellow-600" />
                    </div>
                    <div className="flex-1 text-xs text-gray-600">
                      Our products are custom-stitched after your order.
                      Standard delivery takes 5-7 days (2 days for stitching +
                      3-5 days for shipping).
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="standard"
                      checked={formData.deliveryOption === "standard"}
                      onChange={handleChange}
                      className="h-4 w-4 text-gray-800 focus:ring-gray-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-800">
                        Standard Delivery
                      </span>
                      <span className="block text-xs text-gray-500">
                        5-7 days • ₹49
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="express"
                      checked={formData.deliveryOption === "express"}
                      onChange={handleChange}
                      className="h-4 w-4 text-gray-800 focus:ring-gray-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-800">
                        Express Delivery
                      </span>
                      <span className="block text-xs text-gray-500">
                        Within 2 days • ₹399
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-md font-semibold text-gray-800">
                  Special Instructions
                </h3>
              </div>

              <div className="p-4">
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Any special instructions for delivery (Optional)"
                ></textarea>
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-md font-semibold text-gray-800">
                  Order Total
                </h3>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price:</span>
                  <span className="text-gray-800">₹{orderDetails?.price}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-gray-800">
                    ₹{formData.deliveryOption === "express" ? 399 : 49}
                  </span>
                </div>

                <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-gray-800">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gray-800 text-white font-medium rounded-md"
            >
              Place Order
            </button>
          </form>
        ) : (
          <h1>We collect payment here!!</h1>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
