import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { validateForm } from "../constants/constant";
import { convertCurrency } from "../constants/currency";
import { CurrencyContext } from "../context/currencyContext";
import mixpanel from "../hooks/mixpanel";

// Utility function to calculate dispatch date (3 days from today)
const calculateDispatchDate = () => {
  const today = new Date();
  const dispatchDate = new Date(today);
  dispatchDate.setDate(today.getDate() + 3);
  return dispatchDate.toISOString();
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useAppContext();
  const { currency, setCurrency } = useContext(CurrencyContext);
  const { orderDetails } = location.state || {};
  const [abandonedDocId, setAbandonedDocId] = useState(null);

  const isCartCheckout = !orderDetails;
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "", // NEW: Add email field
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    mobileNumber: "",
    specialInstructions: "",
    deliveryOption: "standard",
    country: "india", // NEW: Add country selection
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
    FUREVER5: 5,
    FUREVER10: 10, // 10% off
    STEFFIE20: 20, // 20% off
  };

  const SINGLE_USE_COUPON = "SPECIAL750"; // ₹750 flat discount

  // Customer validation coupons with ₹100 flat discount
  const CUSTOMER_VALIDATION_COUPONS = {
    FLAT100: "any", // ₹100 flat off for any customer
    WELCOME100: "first", // ₹100 flat off for first-time customers
    RETURN100: "repeat", // ₹100 flat off for repeat customers
  };

  // Special Navratri coupon - 5% discount on Navratri outfits only
  const NAVRATRI_COUPON = "GARBA5";

  // International delivery charges
  const internationalDelivery = {
    singapore: { charge: 21, currency: "SGD", symbol: "$" },
    malaysia: { charge: 39, currency: "MYR", symbol: "RM" },
    usa: { charge: 31, currency: "USD", symbol: "$" },
    uk: { charge: 13, currency: "GBP", symbol: "£" },
    newzealand: { charge: 40, currency: "NZD", symbol: "$" },
    canada: { charge: 49, currency: "CAD", symbol: "$" },
    dubai: { charge: 32, currency: "AED", symbol: "AED" },
  };

  // Currency rates for conversion calculations
  const currencyRates = {
    INR: 1,
    SGD: 0.016,
    MYR: 0.056,
    USD: 0.012,
    GBP: 0.0094,
    NZD: 0.019,
    CAD: 0.016,
    AED: 0.044,
  };

  // Country to currency mapping
  const countryToCurrency = {
    india: "INR",
    singapore: "SGD",
    malaysia: "MYR",
    usa: "USD",
    uk: "GBP",
    newzealand: "NZD",
    canada: "CAD",
    dubai: "AED",
    australia: "AUD",
    germany: "EUR",
    france: "EUR",
    netherlands: "EUR",
    japan: "JPY",
    southkorea: "KRW",
    hongkong: "HKD",
    thailand: "THB",
  };

  // Function to check customer's purchase history
  const checkCustomerType = async (email, mobile) => {
    try {
      // Query orders collection for existing customers
      const ordersRef = collection(db, "orders");

      // Create queries to check for both email and mobile number
      const emailQuery = query(
        ordersRef,
        where("email", "==", email.toLowerCase())
      );
      const mobileQuery = query(ordersRef, where("mobile", "==", mobile));

      // Execute both queries
      const [emailSnapshot, mobileSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(mobileQuery),
      ]);

      // Check if customer has any previous orders
      const hasEmailOrders = !emailSnapshot.empty;
      const hasMobileOrders = !mobileSnapshot.empty;

      if (hasEmailOrders || hasMobileOrders) {
        return "repeat"; // Customer has made previous purchases
      } else {
        return "first"; // First-time customer
      }
    } catch (error) {
      console.error("Error checking customer history:", error);
      return "unknown"; // Return unknown on error - will allow any customer coupons but not specific ones
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (code === SINGLE_USE_COUPON) {
      // Check Firestore if this global single-use coupon is still available
      try {
        const couponRef = doc(db, "singleUseCoupons", code);
        const couponSnap = await getDoc(couponRef);

        if (couponSnap.exists() && couponSnap.data().used) {
          setDiscount(0);
          setCouponError(
            "This coupon has already been used and is no longer available."
          );
          toast.error("❌ Coupon already used");
          return;
        }

        // Coupon is available - apply flat ₹750 discount
        setDiscount(0); // Set to 0 for percentage discount as we'll handle flat discount separately
        setCouponError("");
        toast.success("🎉 Coupon applied: ₹750 off");
      } catch (error) {
        console.error("Error checking coupon:", error);
        setCouponError("Error validating coupon. Please try again.");
        toast.error("❌ Error validating coupon");
        return;
      }
    } else if (CUSTOMER_VALIDATION_COUPONS[code]) {
      // Handle customer validation coupons (₹100 flat discount)
      const requiredCustomerType = CUSTOMER_VALIDATION_COUPONS[code];

      // Check if email and mobile are provided
      if (!formData.email || !formData.mobileNumber) {
        setCouponError(
          "Please enter your email and mobile number to use this coupon."
        );
        toast.error("❌ Email and mobile required for coupon validation");
        return;
      }

      try {
        // Check customer type
        const customerType = await checkCustomerType(
          formData.email,
          formData.mobileNumber
        );

        if (requiredCustomerType === "any") {
          // FLAT100 - available for any customer
          setDiscount(0); // Set to 0 for percentage discount as we'll handle flat discount separately
          setCouponError("");
          toast.success("🎉 Coupon applied: ₹100 off");
        } else if (
          requiredCustomerType === "first" &&
          customerType === "first"
        ) {
          // WELCOME100 - only for first-time customers
          setDiscount(0);
          setCouponError("");
          toast.success("🎉 Welcome! Coupon applied: ₹100 off");
        } else if (
          requiredCustomerType === "repeat" &&
          customerType === "repeat"
        ) {
          // RETURN100 - only for repeat customers
          setDiscount(0);
          setCouponError("");
          toast.success("🎉 Welcome back! Coupon applied: ₹100 off");
        } else if (
          requiredCustomerType === "first" &&
          customerType === "repeat"
        ) {
          setCouponError("This coupon is only valid for first-time customers.");
          toast.error("❌ First-time customer coupon not applicable");
          return;
        } else if (
          requiredCustomerType === "repeat" &&
          customerType === "first"
        ) {
          setCouponError("This coupon is only valid for returning customers.");
          toast.error("❌ Returning customer coupon not applicable");
          return;
        } else {
          setCouponError(
            "Unable to validate customer eligibility for this coupon."
          );
          toast.error("❌ Customer validation failed");
          return;
        }
      } catch (error) {
        console.error("Error validating customer coupon:", error);
        setCouponError("Error validating coupon. Please try again.");
        toast.error("❌ Error validating coupon");
        return;
      }
    } else if (code === NAVRATRI_COUPON) {
      // Special Navratri coupon - check if cart contains NAVRATRI items
      let hasNavratriItems = false;

      if (isCartCheckout) {
        // Check cart items for NAVRATRI in name
        hasNavratriItems = cart.some(
          (item) => item.name && item.name.toUpperCase().includes("NAVRATRI")
        );
      } else {
        // Check single order item for NAVRATRI in name
        hasNavratriItems =
          orderDetails.name &&
          orderDetails.name.toUpperCase().includes("NAVRATRI");
      }

      if (!hasNavratriItems) {
        setDiscount(0);
        setCouponError(
          "This coupon is valid only for Navratri special outfits"
        );
        toast.error("❌ Code valid only for Navratri special outfits");
        return;
      }

      // Apply 5% discount for Navratri items
      setDiscount(5);
      setCouponError("");
      toast.success("🎉 Navratri Special: 5% off applied!");
    } else if (availableCoupons[code]) {
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

    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Auto-set delivery option when country changes
    if (name === "country") {
      if (value === "india") {
        updatedFormData.deliveryOption = "standard";
      } else {
        updatedFormData.deliveryOption = "international";
      }
      // Clear state and pincode when changing countries
      updatedFormData.state = "";
      updatedFormData.pincode = "";

      // Update currency based on selected country
      const newCurrency = countryToCurrency[value] || "INR";
      setCurrency(newCurrency);
    }

    setFormData(updatedFormData);

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

    let discountAmount = 0;

    // Check if it's the special single-use coupon for flat ₹750 discount
    if (couponCode.trim().toUpperCase() === SINGLE_USE_COUPON) {
      discountAmount = 750;
    } else if (CUSTOMER_VALIDATION_COUPONS[couponCode.trim().toUpperCase()]) {
      // Customer validation coupons for flat ₹100 discount
      discountAmount = 100;
    } else if (couponCode.trim().toUpperCase() === NAVRATRI_COUPON) {
      // GARBA5 - 5% discount only on Navratri items
      let navratriSubtotal = 0;

      if (isCartCheckout) {
        // Calculate subtotal only for Navratri items in cart
        navratriSubtotal = cart.reduce((total, item) => {
          if (item.name && item.name.toUpperCase().includes("NAVRATRI")) {
            return total + item.price * item.quantity;
          }
          return total;
        }, 0);
      } else {
        // Single item checkout - check if it's a Navratri item
        if (
          orderDetails.name &&
          orderDetails.name.toUpperCase().includes("NAVRATRI")
        ) {
          navratriSubtotal = orderDetails.price;
        }
      }

      // Apply 5% discount only on Navratri items
      discountAmount = (navratriSubtotal * 5) / 100;
    } else {
      // Regular percentage discount
      discountAmount = (subtotal * discount) / 100;
    }

    const totalAfterDiscount = subtotal - discountAmount;

    let deliveryCharge = 0;

    // Handle international delivery
    if (formData.country !== "india") {
      const deliveryInfo = internationalDelivery[formData.country];
      if (deliveryInfo) {
        // Convert delivery charge from original currency to INR for consistent calculation
        const chargeInINR =
          deliveryInfo.charge / currencyRates[deliveryInfo.currency];
        deliveryCharge = Math.round(chargeInINR);
      }
    } else {
      // Domestic delivery charges
      if (formData.deliveryOption === "express") {
        deliveryCharge = 399;
      } else {
        deliveryCharge = totalAfterDiscount > 1499 ? 0 : 0;
      }
    }

    return Math.round(totalAfterDiscount + deliveryCharge);
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (validateForm(formData, setErrors)) {
      // Send Mixpanel event with all customer data
      mixpanel.track("Address Submitted", {
        ...formData,
        cart: isCartCheckout ? cart : [orderDetails],
        isCartCheckout,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem("customer", JSON.stringify(formData));
      if (!isCartCheckout) {
        localStorage.setItem("order", JSON.stringify(orderDetails));
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
    const totalAmount = calculateTotal(); // Always in INR for Razorpay

    // For international customers, redirect to bank transfer page
    if (formData.country !== "india") {
      const currentCurrency = countryToCurrency[formData.country];
      const displayAmount = convertCurrency(totalAmount, currentCurrency);

      // Extract currency symbol from currency.js
      const currencySymbols = {
        INR: "₹",
        SGD: "S$",
        MYR: "RM",
        USD: "$",
        GBP: "£",
        NZD: "NZ$",
        CAD: "C$",
        AED: "د.إ",
      };
      const currencySymbol =
        currencySymbols[currentCurrency] || currentCurrency;

      // Calculate subtotal, discount, and shipping charges
      let subtotal = 0;
      if (isCartCheckout) {
        subtotal = cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      } else {
        subtotal = orderDetails.price;
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (couponCode.trim().toUpperCase() === "SINGLE750") {
        discountAmount = 750;
      } else if (discount > 0) {
        discountAmount = (subtotal * discount) / 100;
      }

      // Calculate shipping charge for international delivery
      let shippingCharge = 0;
      const deliveryInfo = internationalDelivery[formData.country];
      if (deliveryInfo) {
        const chargeInINR =
          deliveryInfo.charge / currencyRates[deliveryInfo.currency];
        shippingCharge = Math.round(chargeInINR);
      }

      // Prepare order summary for international payment page
      const orderSummary = {
        items: isCartCheckout
          ? [
              ...cart.map((item) => ({
                name: item.name,
                price: Number(
                  convertCurrency(item.price, currentCurrency).replace(
                    /[^\d.-]/g,
                    ""
                  )
                ),
                selectedSize: item.selectedSize,
                quantity: item.quantity || 1,
                isRoyalSet: item.isRoyalSet,
              })),
            ]
          : [
              {
                name: orderDetails.name,
                price: Number(
                  convertCurrency(orderDetails.price, currentCurrency).replace(
                    /[^\d.-]/g,
                    ""
                  )
                ),
                selectedSize: orderDetails.selectedSize,
                quantity: 1,
                isRoyalSet: orderDetails.isRoyalSet,
              },
            ],
        subtotal: Number(
          convertCurrency(subtotal, currentCurrency).replace(/[^\d.-]/g, "")
        ),
        discount: Number(
          convertCurrency(discountAmount, currentCurrency).replace(
            /[^\d.-]/g,
            ""
          )
        ),
        shipping: Number(
          convertCurrency(shippingCharge, currentCurrency).replace(
            /[^\d.-]/g,
            ""
          )
        ),
      };

      const finalAmount = Number(displayAmount.replace(/[^\d.-]/g, ""));

      // Navigate to international payment page with order data
      navigate("/international-payment", {
        state: {
          orderSummary,
          customerDetails: formData,
          finalAmount: finalAmount.toFixed(2),
          currency: currentCurrency,
          currencySymbol: currencySymbol,
        },
      });
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: calculateTotal() }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create order: ${res.status}`);
      }

      const data = await res.json();
      mixpanel.track("Payment Started", {
        country: formData.country,
        currency: currency,
        amount: totalAmount,
      });
      setLoadingPayment(true);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        // amount: data.amount,
        amount: calculateTotal() * 100, // Convert to paise
        currency: data.currency,
        name: "Furever Steffie",
        description: "Order Payment",
        order_id: data.id,
        notes: {
          abandonedDocId: abandonedDocId || "",
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              throw new Error(
                `Payment verification failed: ${verifyRes.status}`
              );
            }

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              mixpanel.track("Payment Success");

              // Mark single-use coupon as used globally in Firestore
              if (couponCode.trim().toUpperCase() === SINGLE_USE_COUPON) {
                try {
                  const couponRef = doc(
                    db,
                    "singleUseCoupons",
                    SINGLE_USE_COUPON
                  );
                  await setDoc(couponRef, {
                    used: true,
                    usedBy: formData.email,
                    usedAt: new Date().toISOString(),
                    customerName: formData.fullName,
                    orderId: response.razorpay_order_id,
                  });
                } catch (error) {
                  console.error("Error marking coupon as used:", error);
                  // Don't fail the order if coupon update fails
                }
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
                        measurements: item.measurements || {},
                      }))
                    : [
                        {
                          ...orderDetails,
                          measurements: orderDetails.measurements || {},
                        },
                      ],
                  amount: data.amount / 100,
                  coupon: couponCode,
                  dispatchDate: calculateDispatchDate(), // Add dispatch date (3 days from today)
                }),
              });

              if (!saveRes.ok) {
                console.error(
                  "Failed to save order, but payment was successful"
                );
                // Still redirect to success page since payment went through
              } else {
                // Order saved successfully, send WhatsApp notification
                try {
                  const saveData = await saveRes.json();
                  const dispatchDate = new Date(calculateDispatchDate());
                  const formattedDispatchDate = dispatchDate.toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );
                  console.log(saveData);

                  // await fetch("/api/send-whatsapp-notification", {
                  //   method: "POST",
                  //   headers: { "Content-Type": "application/json" },
                  //   body: JSON.stringify({
                  //     customerName: formData.fullName,
                  //     orderNumber: response.razorpay_order_id, // Use razorpay_order_id instead of saveData.orderNumber
                  //     items: isCartCheckout
                  //       ? cart.map((item) => ({
                  //           name: item.name,
                  //           quantity: item.quantity || 1,
                  //         }))
                  //       : [
                  //           {
                  //             name: orderDetails.name,
                  //             quantity: 1,
                  //           },
                  //         ],
                  //     totalAmount: data.amount / 100,
                  //     estimatedDelivery: formattedDispatchDate,
                  //     mobileNumber: formData.mobileNumber,
                  //   }),
                  // });
                  // console.log("📱 WhatsApp notification sent");
                } catch (whatsappError) {
                  console.error(
                    "❌ WhatsApp notification failed:",
                    whatsappError
                  );
                  // Don't fail the order if WhatsApp fails
                }
              }

              setLoadingPayment(false);
              navigate({
                pathname: "/thank-you",
                search: `?razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}`,
              });
            } else {
              // Payment verification failed
              mixpanel.track("Payment Verification Failed", {
                order_id: data.id,
                error: verifyData.error || "Verification failed",
              });

              setLoadingPayment(false);

              navigate({
                pathname: "/payment-failed",
                search: `?error_code=VERIFICATION_FAILED&error_description=${encodeURIComponent(
                  verifyData.error || "Payment verification failed"
                )}&order_id=${data.id}`,
              });
            }
          } catch (error) {
            console.error("Error in payment handler:", error);
            mixpanel.track("Payment Handler Error", {
              order_id: data.id,
              error: error.message,
            });

            setLoadingPayment(false);

            navigate({
              pathname: "/payment-failed",
              search: `?error_code=SERVER_ERROR&error_description=${encodeURIComponent(
                error.message
              )}&order_id=${data.id}`,
            });
          }
        },
        modal: {
          ondismiss: function () {
            // User closed the payment modal
            mixpanel.track("Payment Modal Dismissed", {
              order_id: data.id,
            });
            setLoadingPayment(false);

            navigate({
              pathname: "/payment-failed",
              search: `?error_code=USER_CANCELLED&error_description=${encodeURIComponent(
                "Payment was cancelled by user"
              )}&order_id=${data.id}`,
            });
          },
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

      // Handle Razorpay errors
      rzp.on("payment.failed", function (response) {
        mixpanel.track("Payment Failed", {
          order_id: data.id,
          error_code: response.error.code,
          error_description: response.error.description,
          error_source: response.error.source,
          error_step: response.error.step,
        });

        setLoadingPayment(false);

        navigate({
          pathname: "/payment-failed",
          search: `?error_code=${
            response.error.code
          }&error_description=${encodeURIComponent(
            response.error.description
          )}&order_id=${data.id}`,
        });
      });

      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      mixpanel.track("Payment Initiation Error", {
        error: error.message,
      });

      setLoadingPayment(false);

      // Handle network errors or server errors during order creation
      navigate({
        pathname: "/payment-failed",
        search: `?error_code=NETWORK_ERROR&error_description=${encodeURIComponent(
          error.message
        )}`,
      });
    }
  };

  return loadingPayment ? (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      <p className="ml-4 text-lg font-medium text-indigo-600">
        Processing your order...Please wait. Do not refresh or close this page.
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
                        {item.isFullSet
                          ? "Full Set"
                          : item.isDupattaSet
                          ? "Kurta + Dupatta"
                          : "Kurta Only"}{" "}
                        • Size {item.selectedSize}
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
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    💡 We recommend providing a valid email as we&apos;ll share
                    order updates and further steps through email communication.
                  </p>
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

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country*
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                  >
                    <option value="india">🇮🇳 India</option>
                    <option value="singapore">🇸🇬 Singapore</option>
                    <option value="malaysia">🇲🇾 Malaysia</option>
                    <option value="usa">🇺🇸 United States</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="canada">🇨🇦 Canada</option>
                    <option value="australia">🇦🇺 Australia</option>
                    <option value="newzealand">🇳🇿 New Zealand</option>
                    <option value="dubai">🇦🇪 UAE (Dubai)</option>
                    <option value="germany">🇩🇪 Germany</option>
                    <option value="france">🇫🇷 France</option>
                    <option value="netherlands">�� Netherlands</option>
                    <option value="japan">🇯🇵 Japan</option>
                    <option value="southkorea">🇰🇷 South Korea</option>
                    <option value="hongkong">�� Hong Kong</option>
                    <option value="thailand">🇹🇭 Thailand</option>
                  </select>
                  {errors.country && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.country}
                    </p>
                  )}
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
                      {formData.country === "india"
                        ? "State*"
                        : "State/Province"}
                    </label>
                    {formData.country === "india" ? (
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
                        {/* Indian States */}
                        <option value="Andaman and Nicobar Islands">
                          Andaman and Nicobar Islands
                        </option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">
                          Arunachal Pradesh
                        </option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">
                          Dadra and Nagar Haveli and Daman and Diu
                        </option>
                        <option value="Delhi">Delhi</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">
                          Himachal Pradesh
                        </option>
                        <option value="Jammu and Kashmir">
                          Jammu and Kashmir
                        </option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full p-2 border ${
                          errors.state ? "border-red-500" : "border-gray-300"
                        } rounded-md text-sm`}
                        placeholder="Enter state/province"
                      />
                    )}
                    {formData.country === "india" &&
                      errors.state &&
                      formSubmitted && (
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
                    {formData.country === "india" ? "PIN Code*" : "Postal Code"}
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={formData.country === "india" ? 6 : 20}
                    className={`w-full p-2 border ${
                      errors.pincode ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder={
                      formData.country === "india"
                        ? "6-digit PIN code"
                        : "Enter postal code"
                    }
                  />
                  {formData.country === "india" &&
                    errors.pincode &&
                    formSubmitted && (
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
                    maxLength={formData.country === "india" ? 10 : 20}
                    className={`w-full p-2 border ${
                      errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    } rounded-md text-sm`}
                    placeholder={
                      formData.country === "india"
                        ? "10-digit mobile number"
                        : "Mobile number with country code"
                    }
                  />
                  {errors.mobileNumber && formSubmitted && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.mobileNumber}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Required for order updates and delivery coordination.
                    {formData.country !== "india" &&
                      " Include country code (e.g., +1234567890)"}
                  </p>
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
                      {formData.country === "india"
                        ? "Our products are custom-stitched after your order. Standard delivery takes 5-7 days (2 days for stitching + 3-5 days for shipping)."
                        : "Our products are custom-stitched after your order. International delivery takes 10-15 business days (2 days for stitching + 8-13 days for international shipping)."}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.country === "india" ? (
                    <>
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
                          <span className="block text-xs text-green-500">
                            5-7 days • ₹Free
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
                    </>
                  ) : (
                    <label className="flex items-center p-3 border border-gray-200 rounded-md">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="international"
                        checked={formData.deliveryOption === "international"}
                        onChange={handleChange}
                        className="h-4 w-4 text-gray-800 focus:ring-gray-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">
                          International Delivery
                        </span>
                        <span className="block text-xs text-gray-500">
                          10-15 business days •{" "}
                          {internationalDelivery[formData.country]?.currency ||
                            "TBD"}{" "}
                          {internationalDelivery[formData.country]?.charge ||
                            "0"}
                        </span>
                      </div>
                    </label>
                  )}
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
                      if (formData.country !== "india") {
                        // International delivery - convert to current currency
                        const country = internationalDelivery[formData.country];
                        if (country) {
                          // Convert the charge from INR to display currency
                          const chargeInINR =
                            country.charge /
                            (currencyRates[country.currency] || 1);
                          return convertCurrency(chargeInINR, currency);
                        }
                        return "International";
                      }

                      // Domestic delivery
                      const productPrice = isCartCheckout
                        ? cart.reduce((t, i) => t + i.price * i.quantity, 0)
                        : orderDetails.price;

                      const discountAmount = (productPrice * discount) / 100;
                      const totalAfterDiscount = productPrice - discountAmount;

                      if (formData.deliveryOption === "express") {
                        return convertCurrency(399, currency);
                      }
                      if (totalAfterDiscount > 1499) {
                        return "Free";
                      }
                      return "Free";
                    })()}
                  </span>
                </div>
                {(discount > 0 ||
                  couponCode.trim().toUpperCase() === SINGLE_USE_COUPON) && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span>
                      {(() => {
                        if (
                          couponCode.trim().toUpperCase() === SINGLE_USE_COUPON
                        ) {
                          // Flat ₹750 discount
                          return convertCurrency(750, currency);
                        } else {
                          // Percentage discount
                          let subtotal = isCartCheckout
                            ? cart.reduce((t, i) => t + i.price * i.quantity, 0)
                            : orderDetails.price;
                          return convertCurrency(
                            ((subtotal * discount) / 100).toFixed(2),
                            currency
                          );
                        }
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

            {/* International Payment Note */}
            {formData.country !== "india" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    <AlertTriangle size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-sm text-blue-700">
                    <strong>International Payment:</strong> Payment will be
                    processed in Indian Rupees (INR) through our secure payment
                    gateway. The exact amount charged may vary slightly due to
                    exchange rate fluctuations and bank conversion fees.
                  </div>
                </div>
              </div>
            )}

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
