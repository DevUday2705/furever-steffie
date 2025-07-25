import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { validateForm } from "../constants/constant";
import { convertCurrency } from "../constants/currency";
import { CurrencyContext } from "../context/currencyContext";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useAppContext();
  const { orderDetails } = location.state || {};
  const [abandonedDocId, setAbandonedDocId] = useState(null);

  const isCartCheckout = !orderDetails;
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
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const availableCoupons = {
    FUREVER10: 10, // 10% off
    STEFFIE20: 20, // 20% off
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (availableCoupons[code]) {
      const discountPercent = availableCoupons[code];
      setDiscount(discountPercent);
      setCouponError("");
      toast.success(`🎉 Coupon applied: ${discountPercent}% off`);
    } else {
      setDiscount(0);
      setCouponError("Invalid coupon code");
      toast.error("❌ Invalid coupon code");
    }
  };

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
    let subtotal = 0;

    if (isCartCheckout) {
      subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    } else {
      subtotal = orderDetails.price;
    }

    const discountAmount = (subtotal * discount) / 100;
    const totalAfterDiscount = subtotal - discountAmount;

    let deliveryCharge = 0;

    if (totalAfterDiscount <= 1500) {
      deliveryCharge = formData.deliveryOption === "express" ? 199 : 49;
    }

    return Math.round(totalAfterDiscount + deliveryCharge);
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (validateForm(formData, setErrors)) {
      localStorage.setItem("customer", JSON.stringify(formData));
      if (!isCartCheckout) {
        localStorage.setItem("order", JSON.stringify(orderDetails));
      }

      // 🔥 Save abandoned order with better error handling
      try {
        console.log("Attempting to save abandoned order...");
        console.log("Form data:", formData);
        console.log("Order details:", orderDetails);

        const docRef = await addDoc(collection(db, "abandonedOrders"), {
          customer: formData,
          cart: orderDetails,
          timestamp: new Date(),
          status: "pending_payment",
          source: "form_submitted",
          abandoned: true,
          paymentAttempted: false,
        });

        console.log("Document written with ID: ", docRef.id);
        setAbandonedDocId(docRef.id);
      } catch (err) {
        console.error("Failed to save abandoned order:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
      }

      await handlePayment();
    }
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Download receipt as image

  // If no order details, redirect back
  if (!orderDetails && cart.length === 0 && !orderCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Order Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please add items to cart or buy a product first.
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
    const totalAmount = calculateTotal(); // in paise

    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: calculateTotal() }),
    });

    const data = await res.json();
    setLoadingPayment(true);
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "Furever Steffie",
      description: "Order Payment",
      order_id: data.id,
      notes: {
        abandonedDocId: abandonedDocId || "", // Pass this to Razorpay for access in handler
      },
      handler: async function (response) {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          if (abandonedDocId) {
            await updateDoc(doc(db, "abandonedOrders", abandonedDocId), {
              status: "paid",
              abandoned: false,
              paymentAttempted: true,
            });
          }
          const saveRes = await fetch("/api/save-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              customer: formData,
              items: isCartCheckout
                ? cart.map((item) => ({
                    ...item,
                    measurements: item.measurements || {}, // Make sure measurements are included for cart items too
                  }))
                : [
                    {
                      ...orderDetails,
                      measurements: orderDetails.measurements || {}, // safe default
                    },
                  ],
              amount: data.amount / 100,
              coupon: couponCode,
            }),
          });

          navigate({
            pathname: "/thank-you",
            search: `?razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}`,
          });
        } else {
          setLoadingPayment(false); // Hide loader if verification fails
          alert("❌ Payment verification failed.");
        }
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

  const { currency } = useContext(CurrencyContext);

  return loadingPayment ? (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      <p className="ml-4 text-lg font-medium text-indigo-600">
        Processing your order...
      </p>
    </div>
  ) : (
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

              <div className="p-4 space-y-4">
                {(isCartCheckout ? cart : [orderDetails]).map((item, idx) => (
                  <div key={idx} className="flex">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-xs text-gray-600">
                        {item.subcategory}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {item.name}
                      </h4>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.isBeaded ? "Hand Work" : "Simple"} •{" "}
                        {item.isFullSet ? "Full Set" : "Kurta Only"} • Size{" "}
                        {item.selectedSize}
                      </div>
                      {item.quantity && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Qty: {item.quantity}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 ml-2">
                      {convertCurrency(
                        item.price * (item.quantity || 1),
                        currency
                      )}
                    </div>
                  </div>
                ))}
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
            <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-md font-semibold text-gray-800">
                  Have a Coupon?
                </h3>
              </div>
              <div className="p-4 flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="px-4 pb-3 text-xs text-red-500">{couponError}</p>
              )}
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
                  <span className="text-gray-800">
                    {convertCurrency(
                      (isCartCheckout
                        ? cart.reduce((t, i) => t + i.price * i.quantity, 0)
                        : orderDetails.price
                      ).toFixed(2),
                      currency
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-gray-800">
                    {(() => {
                      const productPrice = isCartCheckout
                        ? cart.reduce((t, i) => t + i.price * i.quantity, 0)
                        : orderDetails.price;

                      const discountAmount = (productPrice * discount) / 100;
                      const totalAfterDiscount = productPrice - discountAmount;

                      if (totalAfterDiscount > 1500) {
                        return "Free";
                      }

                      const deliveryCharge =
                        formData.deliveryOption === "express" ? 199 : 49;

                      return convertCurrency(deliveryCharge, currency);
                    })()}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span>
                      {(() => {
                        let subtotal = isCartCheckout
                          ? cart.reduce((t, i) => t + i.price * i.quantity, 0)
                          : orderDetails.price;
                        return convertCurrency(
                          ((subtotal * discount) / 100).toFixed(2),
                          currency
                        );
                      })()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-gray-800">
                    {convertCurrency(calculateTotal(), currency)}
                  </span>
                </div>
              </div>
            </div>

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
