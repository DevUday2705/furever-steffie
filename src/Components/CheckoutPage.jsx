import { useState, useContext, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { Button, Input } from "./ui";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { validateForm } from "../constants/constant";
import { convertCurrency } from "../constants/currency";
import { CurrencyContext } from "../context/currencyContext";
import mixpanel from "../hooks/mixpanel";
import { calculateCheckoutPricing } from "../utils/checkoutPricing";

// Utility function to calculate dispatch date (3 days from today)
const calculateDispatchDate = () => {
  const today = new Date();
  const dispatchDate = new Date(today);
  dispatchDate.setDate(today.getDate() + 3);
  return dispatchDate.toISOString();
};

const CHECKOUT_STEPS = [
  {
    id: "contact",
    title: "Contact details",
    description: "So we can confirm and update the order.",
  },
  {
    id: "address",
    title: "Shipping & delivery",
    description: "Where the order should go and how fast.",
  },
  {
    id: "review",
    title: "Review & payment",
    description: "Check totals, apply coupons, and place the order.",
  },
];

const STEP_FIELDS = {
  0: ["fullName", "email", "mobileNumber"],
  1: ["addressLine1", "city", "state", "pincode", "country"],
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useAppContext();
  const { currency, setCurrency } = useContext(CurrencyContext);
  const { orderDetails } = location.state || {};
  const [abandonedDocId, setAbandonedDocId] = useState(null);
  const [currentCheckoutStep, setCurrentCheckoutStep] = useState(0);

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
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [customCouponData, setCustomCouponData] = useState(null);
  const [customCouponId, setCustomCouponId] = useState(null);

  const availableCoupons = {
    FUREVER5: 5,
    FUREVER10: 10, // 10% off
    STEFFIE20: 20, // 20% off
  };

  // Collaboration coupon - bypasses payment
  const COLLABORATION_COUPON = "FUREVERXCOLLAB";

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

    // Clear any existing custom coupon data
    setCustomCouponData(null);
    setCustomCouponId(null);

    if (code === SINGLE_USE_COUPON) {
      // Apply flat ₹750 discount without checking usage status
      setDiscount(0); // Set to 0 for percentage discount as we'll handle flat discount separately
      setCouponError("");
      toast.success("🎉 Coupon applied: ₹750 off");
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
    } else if (code === COLLABORATION_COUPON) {
      // Collaboration coupon - bypasses payment
      setDiscount(0); // No discount applied, just bypasses payment
      setCouponError("");
      toast.success("🎉 Collaboration coupon applied! Payment will be bypassed.");
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
      // Check for custom coupons in Firestore
      try {
        const customCouponRef = collection(db, "customCoupons");
        const q = query(customCouponRef, where("couponCode", "==", code));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const couponDoc = querySnapshot.docs[0];
          const couponData = couponDoc.data();
          
          // Removed check for coupon usage - allow reuse of coupons
          
          // Check if coupon is expired
          const expiryDate = new Date(couponData.expiryDate);
          const now = new Date();
          if (expiryDate < now) {
            setDiscount(0);
            setCouponError("This coupon has expired.");
            toast.error("❌ Coupon expired");
            return;
          }
          
          // Check if customer email/phone matches (optional validation)
          const customerMatches = 
            !couponData.customerEmail || 
            !couponData.customerPhone || 
            formData.email === couponData.customerEmail ||
            formData.mobileNumber === couponData.customerPhone;
          
          if (!customerMatches && (couponData.customerEmail || couponData.customerPhone)) {
            // If customer details are provided but don't match, show a gentle warning but still allow
            toast.success(`🎉 Custom coupon applied: ₹${couponData.discountAmount} off`);
          } else {
            toast.success(`🎉 Custom coupon applied: ₹${couponData.discountAmount} off`);
          }
          
          // Apply the discount (store discount amount in a special way for custom coupons)
          setDiscount(0); // Set percentage discount to 0
          setCouponError("");
          
          // Store the custom coupon data for later use in calculateTotal
          setCustomCouponData(couponData);
          setCustomCouponId(couponDoc.id);
          
        } else {
          setDiscount(0);
          setCouponError("Invalid coupon code");
          toast.error("❌ Invalid coupon code");
        }
      } catch (error) {
        console.error("Error checking custom coupon:", error);
        setCouponError("Error validating coupon. Please try again.");
        toast.error("❌ Error validating coupon");
      }
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

  const pricing = useMemo(
    () =>
      calculateCheckoutPricing({
        isCartCheckout,
        cart,
        orderDetails,
        couponCode,
        discountPercent: discount,
        customCouponData,
        formData,
        internationalDelivery,
        currencyRates,
        singleUseCoupon: SINGLE_USE_COUPON,
        navratriCoupon: NAVRATRI_COUPON,
        customerValidationCoupons: CUSTOMER_VALIDATION_COUPONS,
      }),
    [
      isCartCheckout,
      cart,
      orderDetails,
      couponCode,
      discount,
      customCouponData,
      formData,
      internationalDelivery,
      currencyRates,
      CUSTOMER_VALIDATION_COUPONS,
    ]
  );

  const checkoutItemCount = pricing.items.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const validateCheckoutStep = (stepIndex) => {
    const stepErrors = {};

    if (stepIndex === 0) {
      if (!formData.fullName.trim()) {
        stepErrors.fullName = "Full name is required";
      }

      if (!formData.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = "Enter a valid email address";
      }

      if (!formData.mobileNumber.trim()) {
        stepErrors.mobileNumber = "Mobile number is required";
      } else {
        const cleanNumber = formData.mobileNumber.replace(/[\s\-()+ ]/g, "");
        if (formData.country === "india") {
          if (!/^\d{10}$/.test(cleanNumber)) {
            stepErrors.mobileNumber = "Enter a valid 10-digit mobile number";
          }
        } else if (!/^\d{7,15}$/.test(cleanNumber)) {
          stepErrors.mobileNumber = "Enter a valid mobile number (7-15 digits)";
        }
      }
    }

    if (stepIndex === 1) {
      if (!formData.addressLine1.trim()) {
        stepErrors.addressLine1 = "Address is required";
      }

      if (!formData.city.trim()) {
        stepErrors.city = "City is required";
      }

      if (!formData.country.trim()) {
        stepErrors.country = "Country is required";
      }

      if (formData.country === "india" && !formData.state.trim()) {
        stepErrors.state = "State is required";
      }

      if (formData.country === "india") {
        if (!formData.pincode.trim()) {
          stepErrors.pincode = "PIN code is required";
        } else if (!/^\d{6}$/.test(formData.pincode)) {
          stepErrors.pincode = "Enter a valid 6-digit PIN code";
        }
      } else if (
        formData.pincode.trim() &&
        formData.pincode.trim().length < 3
      ) {
        stepErrors.pincode = "Enter a valid postal code";
      }
    }

    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      (STEP_FIELDS[stepIndex] || []).forEach((field) => {
        delete nextErrors[field];
      });

      return { ...nextErrors, ...stepErrors };
    });

    return Object.keys(stepErrors).length === 0;
  };

  const handleNextCheckoutStep = () => {
    setFormSubmitted(true);

    if (!validateCheckoutStep(currentCheckoutStep)) {
      return;
    }

    const step = CHECKOUT_STEPS[currentCheckoutStep];
    mixpanel.track("Checkout Step Completed", {
      step: step.id,
      total: pricing.total,
      isCartCheckout,
      itemCount: checkoutItemCount,
    });

    setCurrentCheckoutStep((previousStep) =>
      Math.min(previousStep + 1, CHECKOUT_STEPS.length - 1)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousCheckoutStep = () => {
    setCurrentCheckoutStep((previousStep) => Math.max(previousStep - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (pricing.items.length === 0) {
      return;
    }

    mixpanel.track("Checkout Started", {
      total: pricing.total,
      isCartCheckout,
      itemCount: checkoutItemCount,
      country: formData.country,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pricing.items.length === 0) {
      return;
    }

    const step = CHECKOUT_STEPS[currentCheckoutStep];
    mixpanel.track("Checkout Step Viewed", {
      step: step.id,
      total: pricing.total,
      isCartCheckout,
      itemCount: checkoutItemCount,
    });
  }, [currentCheckoutStep, pricing.items.length, pricing.total, isCartCheckout, checkoutItemCount]);
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

      // Track abandoned checkout for cart recovery
      try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const trackingData = {
          sessionId,
          email: formData.email,
          phone: formData.mobileNumber,
          name: formData.fullName,
          cart: isCartCheckout ? cart : [orderDetails],
          cartTotal: pricing.total,
          address: formData
        };

        // Call track-address API 
        await fetch('/api/track-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackingData)
        });

        // Store sessionId for later use (to mark as converted if payment succeeds)
        setAbandonedDocId(sessionId);
        localStorage.setItem('abandonedSessionId', sessionId);

        console.log('✅ Abandoned checkout tracked:', sessionId);
      } catch (error) {
        console.error('❌ Failed to track abandoned checkout:', error);
        // Don't block checkout if tracking fails
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
  if (!orderDetails && cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Order Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please add items to cart or buy a product first.
          </p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    const totalAmount = pricing.total; // Always in INR for Razorpay

    // For international customers, redirect to bank transfer page
    if (pricing.isInternational) {
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
          convertCurrency(pricing.subtotal, currentCurrency).replace(
            /[^\d.-]/g,
            ""
          )
        ),
        discount: Number(
          convertCurrency(pricing.discountAmount, currentCurrency).replace(
            /[^\d.-]/g,
            ""
          )
        ),
        shipping: Number(
          convertCurrency(pricing.deliveryCharge, currentCurrency).replace(
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

    // Check if collaboration coupon is applied - bypass payment
    if (couponCode.trim().toUpperCase() === COLLABORATION_COUPON) {
      try {
        setLoadingPayment(true);
        
        // Generate a mock order ID for collaboration orders
        const mockOrderId = `COLLAB-${Date.now()}`;
        const mockPaymentId = `COLLAB-PAY-${Date.now()}`;
        
        mixpanel.track("Collaboration Order Created", {
          country: formData.country,
          currency: currency,
          amount: totalAmount,
          coupon: COLLABORATION_COUPON,
        });

        // Mark abandoned checkout as converted for collaboration orders
        try {
          const sessionId = abandonedDocId || localStorage.getItem('abandonedSessionId');
          if (sessionId) {
            await fetch('/api/mark-converted', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });
            console.log('✅ Abandoned checkout marked as converted (collaboration):', sessionId);
            localStorage.removeItem('abandonedSessionId');
          }
        } catch (error) {
          console.error('❌ Failed to mark abandoned checkout as converted (collaboration):', error);
          // Don't fail the order if conversion tracking fails
        }

        // Save the order directly without payment
        const saveRes = await fetch("/api/save-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: mockOrderId,
            razorpay_payment_id: mockPaymentId,
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
            amount: pricing.total,
            coupon: couponCode,
            dispatchDate: calculateDispatchDate(),
            isCollaboration: true, // Add collaboration flag
            customCouponId: customCouponId || null, // Pass custom coupon ID
          }),
        });

        if (!saveRes.ok) {
          throw new Error(`Failed to save collaboration order: ${saveRes.status}`);
        }

        await saveRes.json();
        
        setLoadingPayment(false);
        
        // Navigate to success page
        navigate({
          pathname: "/thank-you",
          search: `?razorpay_order_id=${mockOrderId}&razorpay_payment_id=${mockPaymentId}&collaboration=true`,
        });
        
        return;
      } catch (error) {
        console.error("Error creating collaboration order:", error);
        setLoadingPayment(false);
        toast.error("❌ Failed to create collaboration order. Please try again.");
        return;
      }
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: pricing.total }),
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
        amount: pricing.total * 100, // Convert to paise
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

              // Mark abandoned checkout as converted
              try {
                const sessionId = abandonedDocId || localStorage.getItem('abandonedSessionId');
                if (sessionId) {
                  await fetch('/api/mark-converted', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                  });
                  console.log('✅ Abandoned checkout marked as converted:', sessionId);
                  localStorage.removeItem('abandonedSessionId');
                }
              } catch (error) {
                console.error('❌ Failed to mark abandoned checkout as converted:', error);
                // Don't fail the order if conversion tracking fails
              }

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
                  customCouponId: customCouponId || null, // Pass custom coupon ID
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
                  await saveRes.json();
                 
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
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Checkout progress
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {CHECKOUT_STEPS[currentCheckoutStep].title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {CHECKOUT_STEPS[currentCheckoutStep].description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {checkoutItemCount} item{checkoutItemCount !== 1 ? "s" : ""}
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {convertCurrency(pricing.total, currency)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-4">
              {CHECKOUT_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`rounded-lg border px-3 py-2 text-center ${
                    index === currentCheckoutStep
                      ? "border-gray-900 bg-gray-900 text-white"
                      : index < currentCheckoutStep
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide">
                    Step {index + 1}
                  </div>
                  <div className="mt-1 text-xs font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </div>

          {currentCheckoutStep === 0 && (
            <>
              <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800">
                    Contact Information
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <Input
                    label="Full Name"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    error={formSubmitted ? errors.fullName : undefined}
                  />
                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    error={formSubmitted ? errors.email : undefined}
                    hint="We'll send order updates and follow-up information here."
                  />
                  <Input
                    label="Mobile Number"
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    maxLength={formData.country === "india" ? 10 : 20}
                    placeholder={
                      formData.country === "india"
                        ? "10-digit mobile number"
                        : "Mobile number with country code"
                    }
                    autoComplete="tel"
                    required
                    error={formSubmitted ? errors.mobileNumber : undefined}
                    hint="Required for delivery coordination and urgent updates."
                  />
                </div>
              </div>

              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={handleNextCheckoutStep}
              >
                Continue to shipping
              </Button>
            </>
          )}

          {currentCheckoutStep === 1 && (
            <>
              <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800">
                    Shipping Address
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <Input
                    label="Address Line 1"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="House/Flat number, Building name"
                    autoComplete="address-line1"
                    required
                    error={formSubmitted ? errors.addressLine1 : undefined}
                  />
                  <Input
                    label="Address Line 2"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Street name, Area (Optional)"
                    autoComplete="address-line2"
                  />
                  <Input
                    as="select"
                    label="Country"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    autoComplete="country-name"
                    required
                    error={formSubmitted ? errors.country : undefined}
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
                    <option value="netherlands">🇳🇱 Netherlands</option>
                    <option value="japan">🇯🇵 Japan</option>
                    <option value="southkorea">🇰🇷 South Korea</option>
                    <option value="hongkong">🇭🇰 Hong Kong</option>
                    <option value="thailand">🇹🇭 Thailand</option>
                  </Input>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      autoComplete="address-level2"
                      required
                      error={formSubmitted ? errors.city : undefined}
                    />
                    <div>
                      <label
                        htmlFor="state"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        {formData.country === "india"
                          ? "State"
                          : "State/Province"}
                        {formData.country === "india" && (
                          <span className="ml-0.5 text-danger-500">*</span>
                        )}
                      </label>
                      {formData.country === "india" ? (
                        <Input
                          as="select"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          autoComplete="address-level1"
                          error={formSubmitted ? errors.state : undefined}
                        >
                          <option value="">Select State</option>
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
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
                        </Input>
                      ) : (
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="Enter state/province"
                          autoComplete="address-level1"
                        />
                      )}
                    </div>
                  </div>

                  <Input
                    label={formData.country === "india" ? "PIN Code" : "Postal Code"}
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={formData.country === "india" ? 6 : 20}
                    placeholder={
                      formData.country === "india"
                        ? "6-digit PIN code"
                        : "Enter postal code"
                    }
                    autoComplete="postal-code"
                    required={formData.country === "india"}
                    error={formSubmitted ? errors.pincode : undefined}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800">
                    Delivery Options
                  </h3>
                </div>

                <div className="p-4 space-y-3">
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
                            Standard Shipping
                          </span>
                          <span className="block text-xs text-green-500">
                            5-7 days • Free
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center p-3 border border-gray-200 rounded-md">
                        <input
                          type="radio"
                          name="deliveryOption"
                          value="air"
                          checked={formData.deliveryOption === "air"}
                          onChange={handleChange}
                          className="h-4 w-4 text-gray-800 focus:ring-gray-500"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-800">
                            Air Shipping
                          </span>
                          <span className="block text-xs text-blue-500">
                            3-4 days • ₹199
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
                            Express Shipping
                          </span>
                          <span className="block text-xs text-red-500">
                            1-2 days • ₹399
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
                          {internationalDelivery[formData.country]?.charge || "0"}
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800">
                    Special Instructions
                  </h3>
                </div>

                <div className="p-4">
                  <Input
                    as="textarea"
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special instructions for delivery (Optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={handlePreviousCheckoutStep}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  onClick={handleNextCheckoutStep}
                >
                  Review order
                </Button>
              </div>
            </>
          )}

          {currentCheckoutStep === 2 && (
            <>
              <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800">
                    Order Summary
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {pricing.items.map((item, idx) => (
                    <div key={idx} className="flex">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
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
                            : item.category}{" "}
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

              <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800">
                    Have a Coupon?
                  </h3>
                </div>
                <div className="p-4 flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="couponCode"
                      name="couponCode"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      error={couponError || undefined}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={applyCoupon}
                    className="self-start mt-0"
                  >
                    Apply
                  </Button>
                </div>
              </div>

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
                      {convertCurrency(pricing.subtotal.toFixed(2), currency)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="text-gray-800">
                      {pricing.deliveryCharge > 0
                        ? convertCurrency(pricing.deliveryCharge, currency)
                        : "Free"}
                    </span>
                  </div>

                  {(discount > 0 ||
                    couponCode.trim().toUpperCase() === SINGLE_USE_COUPON ||
                    CUSTOMER_VALIDATION_COUPONS[couponCode.trim().toUpperCase()] ||
                    customCouponData) && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount:</span>
                      <span>
                        {(() => {
                          if (
                            couponCode.trim().toUpperCase() === SINGLE_USE_COUPON
                          ) {
                            return convertCurrency(750, currency);
                          }

                          if (
                            CUSTOMER_VALIDATION_COUPONS[
                              couponCode.trim().toUpperCase()
                            ]
                          ) {
                            return convertCurrency(100, currency);
                          }

                          if (customCouponData) {
                            return convertCurrency(
                              customCouponData.discountAmount,
                              currency
                            );
                          }

                          return convertCurrency(
                            pricing.discountAmount.toFixed(2),
                            currency
                          );
                        })()}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">
                      {convertCurrency(pricing.total, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {formData.country !== "india" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      <AlertTriangle size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 text-sm text-blue-700">
                      <strong>International Payment:</strong> Payment will be
                      processed in Indian Rupees (INR) through our secure
                      payment gateway. The exact amount charged may vary slightly
                      due to exchange rate fluctuations and bank conversion fees.
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={handlePreviousCheckoutStep}
                >
                  Back
                </Button>
                <Button type="submit" fullWidth size="lg">
                  Place Order
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
