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
} from "lucide-react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import UPIPayment from "./UPIPayment";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const { orderDetails, sizeConfirmed } = location.state || {};
  const [steps, setSteps] = useState({
    download: false,
    share: false,
    payment: false,
  });

  // Generate unique order ID
  const orderId = `ORD${Date.now().toString().slice(-6)}${Math.floor(
    Math.random() * 1000
  )}`;

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
  const [paymentDone, setPaymentDone] = useState(false);
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    }

    if (
      formData.alternateMobile.trim() &&
      !/^\d{10}$/.test(formData.alternateMobile)
    ) {
      newErrors.alternateMobile = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (validateForm()) {
      // In a real app, this would submit the order to a backend
      setOrderCompleted(true);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Download receipt as image
  const handlePrint = () => {
    if (receiptRef.current) {
      // Store original styles
      const originalVisibility = receiptRef.current.style.visibility;
      const originalHeight = receiptRef.current.style.height;
      const originalZIndex = receiptRef.current.style.zIndex;

      // Make temporarily visible for capture
      receiptRef.current.style.visibility = "visible";
      receiptRef.current.style.height = "auto";
      receiptRef.current.style.zIndex = "9999";

      toPng(receiptRef.current, {
        cacheBust: true,
        filter: (node) => {
          return !node.classList || !node.classList.contains("exclude");
        },
      })
        .then((dataUrl) => {
          // Restore original styles
          receiptRef.current.style.visibility = originalVisibility;
          receiptRef.current.style.height = originalHeight;
          receiptRef.current.style.zIndex = originalZIndex;

          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "receipt.png";
          link.click();
        })
        .catch((error) => {
          // Restore original styles even if there's an error
          receiptRef.current.style.visibility = originalVisibility;
          receiptRef.current.style.height = originalHeight;
          receiptRef.current.style.zIndex = originalZIndex;

          console.error("Error generating image:", error);
        });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const downloadReceipt = () => {
    // In a real app, this would generate and download a PDF
    // setSteps((prev) => ({ ...prev, download: true }));
    // Simulate download delay
    const element = document.getElementById("receipt");
    domtoimage.toPng(element).then((dataUrl) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "receipt.png";
      link.click();
    });
  };

  const shareOnWhatsapp = async () => {
    try {
      // Check if receipt element exists
      const receiptElement = document.getElementById("receipt");
      if (!receiptElement) {
        console.error("Receipt element not found");
        alert("Receipt element not found. Please try again.");
        return;
      }

      // Import dom-to-image dynamically
      let domtoimage;
      try {
        domtoimage = await import("dom-to-image");
      } catch (importError) {
        console.error("Failed to import dom-to-image:", importError);
        alert(
          "Failed to load image processing library. Please check your installation."
        );
        return;
      }

      // Make sure the element is visible and rendered
      receiptElement.scrollIntoView({ behavior: "auto", block: "center" });

      // Wait a short moment to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try to convert the DOM element to a PNG blob with enhanced options
      let blob;
      try {
        blob = await domtoimage.toBlob(receiptElement, {
          quality: 0.95,
          bgcolor: "#FFFFFF",
          height: receiptElement.offsetHeight,
          width: receiptElement.offsetWidth,
          style: {
            transform: "scale(2)",
            "transform-origin": "top left",
          },
          cacheBust: true, // Add cache busting for images
          imagePlaceholder: "data:image/png;base64,iVBORw0KGgo=", // Placeholder for failed images
        });
      } catch (imageError) {
        console.error("Failed to create image:", imageError);

        // Try alternative method if first method fails
        try {
          console.log("Trying alternative method...");
          blob = await domtoimage.toBlob(receiptElement);
        } catch (fallbackError) {
          console.error("Both image creation methods failed:", fallbackError);
          alert("Failed to create receipt image. Please try again later.");
          return;
        }
      }

      if (!blob) {
        console.error("No blob was created");
        alert("Failed to create receipt image. Please try again.");
        return;
      }

      // Try to share the image
      const fileToShare = new File([blob], "receipt.png", {
        type: "image/png",
      });

      // First try the Web Share API
      if (navigator.share && navigator.canShare({ files: [fileToShare] })) {
        try {
          await navigator.share({
            files: [fileToShare],
            title: "Order Receipt",
            text: "Here is your order receipt",
          });
          setSteps((prev) => ({ ...prev, share: true }));
          return;
        } catch (shareError) {
          console.error("Web Share API failed:", shareError);
          // Continue to fallback method
        }
      }

      // Fallback method
      try {
        const imageUrl = URL.createObjectURL(blob);

        // Open WhatsApp with text
        const message = "Here's my order receipt. Please process my order.";
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");

        // Also trigger download
        const downloadLink = document.createElement("a");
        downloadLink.href = imageUrl;
        downloadLink.download = "receipt.png";
        document.body.appendChild(downloadLink); // Add to DOM to ensure it works in all browsers
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setSteps((prev) => ({ ...prev, share: true }));
      } catch (fallbackError) {
        console.error("Fallback sharing failed:", fallbackError);
        alert("Failed to share image. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error in shareOnWhatsapp:", error);
      alert("Something went wrong. Please try again.");
    }
  };
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
          <div>
            {/* Order Success */}

            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-green-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                    <Check size={18} className="text-green-600" />
                  </div>
                  <h3 className="ml-2 text-md font-semibold text-gray-800">
                    Order Placed Successfully
                  </h3>
                </div>
              </div>
              <div id="receipt" className="p-4 bg-white">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold">Order Receipt</h2>
                </div>

                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">
                      Order ID: {orderId}
                    </div>
                    <div className="text-gray-600 text-xs">
                      Date: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-base">
                      ₹{calculateTotal()}
                    </div>
                    <div className="text-gray-600 text-xs">Total Amount</div>
                  </div>
                </div>

                <div className="border-t border-b border-gray-200 py-3 mb-4">
                  <div className="flex mb-3">
                    <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={orderDetails?.image}
                        alt={orderDetails?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="font-medium text-sm">
                        {orderDetails?.name}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {orderDetails?.isBeaded ? "Hand Work" : "Simple"} •{" "}
                        {orderDetails?.isFullSet ? "Full Set" : "Kurta Only"} •
                        Size {orderDetails?.selectedSize}
                      </div>
                      <div className="font-medium text-sm mt-1">
                        ₹{orderDetails?.price}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-gray-600 text-xs">
                    <div className="flex justify-between">
                      <span>
                        Delivery (
                        {formData.deliveryOption === "express"
                          ? "Express"
                          : "Standard"}
                        ):
                      </span>
                      <span>
                        ₹{formData.deliveryOption === "express" ? 399 : 49}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-black pt-2">
                      <span>Total:</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <div className="font-medium text-sm mb-1">
                      Shipping Information:
                    </div>
                    <div className="text-gray-600 text-xs space-y-0.5">
                      <div>{formData.fullName}</div>
                      <span>{formData.addressLine1}</span>,
                      {formData.addressLine2 && (
                        <span>{formData.addressLine2}</span>
                      )}
                      <div>
                        {formData.city}, {formData.state}, {formData.pincode}
                      </div>
                      <div>Phone: {formData.mobileNumber}</div>
                      {formData.alternateMobile && (
                        <div>Alt Phone: {formData.alternateMobile}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm mb-1">Order Notes:</div>
                    <div className="text-gray-600 text-xs">
                      {formData.specialInstructions
                        ? formData.specialInstructions
                        : "No special instructions provided."}
                    </div>
                  </div>
                </div>
              </div>
              <div className=" bg-gray-100 flex flex-col items-center px-4 py-8">
                <motion.div
                  className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-6">
                    <motion.div
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <button
                          onClick={downloadReceipt}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                            steps.download
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                          } transition-all duration-200`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                                steps.download
                                  ? "bg-green-100 text-green-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {steps.download ? (
                                <CheckCircle size={18} />
                              ) : (
                                <span>1</span>
                              )}
                            </div>
                            <div onClick={handlePrint}>
                              <h4 className="font-medium text-gray-800">
                                Download Receipt
                              </h4>
                              <p className="text-xs text-gray-500">
                                Save your order details
                              </p>
                            </div>
                          </div>
                          <Download size={20} className="text-gray-400" />
                        </button>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <div
                          className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                            steps.payment
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200"
                          } transition-all duration-200`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                                steps.payment
                                  ? "bg-green-100 text-green-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {steps.payment ? (
                                <CheckCircle size={18} />
                              ) : (
                                <span>2</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                Make Payment
                              </h4>
                              <p className="text-xs text-gray-500">
                                Pay using UPI or Bank Transfer
                              </p>
                            </div>
                          </div>
                          <CreditCard size={20} className="text-gray-400" />
                        </div>
                      </motion.div>
                      <div>
                        <button
                          onClick={shareOnWhatsapp}
                          className="w-full flex items-center justify-between p-4 rounded-lg border bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <div className="rounded-full w-8 h-8 flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                              <span>3</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                Share on WhatsApp
                              </h4>
                              <p className="text-xs text-gray-500">
                                Send receipt to process order
                              </p>
                            </div>
                          </div>
                          <span>Share</span>
                        </button>
                      </div>
                      <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border border-blue-200 mt-4 shadow-sm"
                      >
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <CreditCard
                            size={20}
                            className="text-blue-500 mr-2"
                          />
                          <span>Payment Options</span>
                        </h4>

                        <p className="text-sm text-gray-700 mb-3 flex items-center">
                          <Info size={16} className="text-blue-500 mr-2" />
                          <span>
                            You can pay using UPI apps like Google Pay, PhonePe,
                            Paytm, etc.
                          </span>
                        </p>

                        <div className="flex justify-between items-center mb-3">
                          <div className="flex space-x-3">
                            <img
                              src="/images/gpay.png"
                              alt="Google Pay"
                              className="h-6 w-6 rounded"
                            />
                            <img
                              src="/images/phonepe.png"
                              alt="PhonePe"
                              className="h-6 w-6 rounded"
                            />
                            <img
                              src="/images/paytm.png"
                              alt="Paytm"
                              className="h-6 w-6 rounded"
                            />
                            <img
                              src="/images/bhim.png"
                              alt="Other UPI"
                              className="h-6 w-6 rounded"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <Smartphone
                                size={18}
                                className="text-blue-500 mr-2"
                              />
                              <span className="text-gray-600">
                                Mobile Number:
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                9876543210
                              </span>
                              <button
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText("9876543210");
                                  toast.success("Copied!");
                                }}
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <CreditCard
                                size={18}
                                className="text-blue-500 mr-2"
                              />
                              <span className="text-gray-600">UPI ID:</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                dogstyle@upi
                              </span>
                              <button
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText("dogstyle@upi");
                                  toast.success("Copied!");
                                }}
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <CreditCard
                                size={18}
                                className="text-blue-500 mr-2"
                              />
                              <span className="text-gray-600">
                                Bank Account:
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                123456789012
                              </span>
                              <button
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText("123456789012");
                                  toast.success("Copied!");
                                }}
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <User size={18} className="text-blue-500 mr-2" />
                              <span className="text-gray-600">
                                Account Name:
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                DogStyle Apparel
                              </span>
                              <button
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    "DogStyle Apparel"
                                  );
                                  toast.success("Copied!");
                                }}
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <Building
                                size={18}
                                className="text-blue-500 mr-2"
                              />
                              <span className="text-gray-600">IFSC Code:</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                ABCD0001234
                              </span>
                              <button
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText("ABCD0001234");
                                  toast.success("Copied!");
                                }}
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3 flex items-center">
                          <AlertCircle
                            size={14}
                            className="text-yellow-500 mr-1"
                          />
                          <span>
                            Please include your Order ID in payment remarks
                          </span>
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants} className="mt-8">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Note:</span> Your
                            order will be confirmed and processed once we
                            receive your payment and receipt via WhatsApp.
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
              {/* <div className="p-4">
                <button
                  onClick={() => setPaymentDone(true)}
                  className="w-full flex items-center justify-center py-3 bg-gray-800 text-white font-medium rounded-md"
                >
                  Payment Done? Get Receipt
                </button>
                <button
                  onClick={() => console.log("contact us")}
                  className="w-full flex items-center mt-2 justify-center py-3 bg-gray-50 text-gray-800 border border-gray-800 font-medium rounded-md"
                >
                  Having Trouble? Contact Us{" "}
                </button>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
