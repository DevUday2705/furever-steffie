import { useState } from "react";
import toast from "react-hot-toast";

const OrderUtility = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `L${random}${timestamp}`;
  };

  const generateRazorpayIds = () => {
    const orderSuffix = Math.random().toString(36).substring(2, 12);
    const paySuffix = Math.random().toString(36).substring(2, 12);
    return {
      razorpay_order_id: `order_${orderSuffix}`,
      razorpay_payment_id: `pay_${paySuffix}`,
    };
  };

  const transformJsonToOrder = (inputData, orderAmount) => {
    const { properties } = inputData;
    const razorpayIds = generateRazorpayIds();

    // Generate dispatch date (7 days from now)
    const dispatchDate = new Date();
    dispatchDate.setDate(dispatchDate.getDate() + 7);

    return {
      id: generateOrderId(),
      amount: parseInt(orderAmount),
      coupon: null,
      razorpay_payment_id: razorpayIds.razorpay_payment_id,
      razorpay_order_id: razorpayIds.razorpay_order_id,
      orderStatus: "pending",
      items: properties.cart || [],
      orderSource: "manual-entry",
      dispatchDate: dispatchDate.toISOString(),
      paymentStatus: "paid",
      orderNumber: "",
      customer: {
        email: properties.email || "",
        specialInstructions: properties.specialInstructions || "",
        city: properties.city || "",
        fullName: properties.fullName || "",
        country: properties.country || "",
        addressLine2: properties.addressLine2 || "",
        state: properties.state || "",
        mobileNumber: properties.mobileNumber || "",
        deliveryOption: properties.deliveryOption || "standard",
        addressLine1: properties.addressLine1 || "",
        pincode: properties.pincode || "",
      },
      createdAt: new Date().toISOString(),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jsonInput.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    if (!amount.trim()) {
      toast.error("Please enter amount");
      return;
    }

    try {
      setIsProcessing(true);

      // Parse JSON input
      const inputData = JSON.parse(jsonInput);

      // Validate JSON structure
      if (!inputData.properties || !inputData.properties.cart) {
        toast.error("Invalid JSON structure. Missing properties.cart");
        return;
      }

      // Transform to order format
      const orderPayload = transformJsonToOrder(inputData, amount);

      console.log("Order Payload:", orderPayload);

      // Send to API
      const response = await fetch("/api/save-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Order created successfully! ID: ${orderPayload.id}`);
        console.log("API Response:", result);

        // Clear form
        setJsonInput("");
        setAmount("");
      } else {
        const error = await response.text();
        toast.error(`API Error: ${error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format. Please check your input.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted successfully");
    } catch {
      toast.error("Invalid JSON - cannot format");
    }
  };

  const clearForm = () => {
    setJsonInput("");
    setAmount("");
    toast.success("Form cleared");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🛠️ Order Utility Tool
          </h1>
          <p className="text-gray-600 mb-6">
            Convert JSON data to order format and submit to save-order API
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* JSON Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  JSON Input Data
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={formatJson}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Format JSON
                  </button>
                  <button
                    type="button"
                    onClick={clearForm}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <textarea
                value={jsonInput}
                onChange={handleJsonChange}
                placeholder="Paste your JSON data here..."
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-y"
                required
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter order amount (e.g., 2399)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? "Processing..." : "🚀 Create Order"}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              📋 Instructions:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Paste JSON data with &quot;properties&quot; containing
                customer info and &quot;cart&quot; array
              </li>
              <li>• Enter the order amount in the amount field</li>
              <li>
                • The tool will automatically map cart → items and properties →
                customer
              </li>
              <li>
                • Auto-generates order ID, Razorpay IDs, and dispatch date
              </li>
              <li>
                • Sets order status to &quot;pending&quot; and payment status to
                &quot;paid&quot;
              </li>
            </ul>
          </div>

          {/* Sample JSON */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              📝 Sample JSON Format:
            </h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {`{
  "event": "Address Submitted",
  "properties": {
    "addressLine1": "2 Amber Close",
    "city": "Parklea",
    "fullName": "Aarya Tickoo",
    "email": "aarya.tickoo@live.com",
    "cart": [
      {
        "category": "kurta",
        "name": "Blue SeaShell Tails",
        "price": 2399,
        "selectedSize": "L"
      }
    ]
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderUtility;
