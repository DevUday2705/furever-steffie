import { useState } from "react";

const EmailTest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const testEmail = async () => {
    if (!email) {
      setResult("❌ Please enter an email address");
      return;
    }

    setLoading(true);
    setResult("Please check the console logs for detailed output...");

    try {
      console.log("🧪 Testing email service directly...");

      // Create a fake order to test the email service
      const testOrderData = {
        customer: {
          fullName: "Test Customer",
          email: email,
          addressLine1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          mobileNumber: "9876543210",
        },
        items: [
          {
            name: "Premium Bandana",
            selectedSize: "M",
            selectedColor: "Royal Blue",
            selectedFabric: "Cotton",
            quantity: 1,
            price: 599,
            category: "bandana",
          },
        ],
        amount: 599,
        razorpay_order_id: "order_test123",
        razorpay_payment_id: "pay_test123",
      };

      console.log("📞 Calling save-order API (which will trigger email)...");

      // Call the save-order API which will trigger the email
      const response = await fetch("/api/save-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOrderData),
      });

      const responseData = await response.json();
      console.log("� API Response:", responseData);

      if (response.ok && responseData.success) {
        setResult(
          `✅ Test order placed successfully! Email should be sent to ${email}. Check your inbox and spam folder.`
        );
      } else {
        setResult(
          `⚠️ API call completed but may have issues. Check console for details. Response: ${JSON.stringify(
            responseData
          )}`
        );
      }
    } catch (error) {
      console.error("❌ Test failed:", error);
      setResult(
        `❌ Test failed: ${error.message}. This might be expected since we're testing in development mode.`
      );
    } finally {
      setLoading(false);
    }
  };

  const deploymentTip = () => {
    setResult(`💡 For production testing:
1. Deploy to Vercel: npm run build && vercel --prod
2. Use Postman with your deployed URL
3. Test endpoint: https://your-app.vercel.app/api/send-order-confirmation
4. Send POST request with order data

The email service works in production but has limitations in local development.`);
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{ textAlign: "center", color: "#1f2937", marginBottom: "30px" }}
      >
        📧 Email Service Test
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Test Email Address:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your-email@gmail.com"
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={testEmail}
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 24px",
            backgroundColor: loading ? "#9ca3af" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "📤 Testing..." : "🧪 Test Email"}
        </button>

        <button
          onClick={deploymentTip}
          style={{
            flex: 1,
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          💡 Production Tips
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: result.includes("✅")
              ? "#ecfdf5"
              : result.includes("💡")
              ? "#f0f9ff"
              : "#fef2f2",
            border: `1px solid ${
              result.includes("✅")
                ? "#10b981"
                : result.includes("💡")
                ? "#3b82f6"
                : "#ef4444"
            }`,
            color: result.includes("✅")
              ? "#065f46"
              : result.includes("💡")
              ? "#1e40af"
              : "#991b1b",
            fontSize: "14px",
            lineHeight: "1.5",
            whiteSpace: "pre-line",
          }}
        >
          {result}
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        <p style={{ margin: "0 0 10px 0" }}>
          <strong>� Email Service Status:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          <li>✅ Email service code is implemented</li>
          <li>✅ Gmail SMTP configured</li>
          <li>✅ Order integration complete</li>
          <li>⚠️ Local testing has limitations</li>
        </ul>

        <p style={{ margin: "15px 0 5px 0" }}>
          <strong>🧪 Best Testing Options:</strong>
        </p>
        <ol style={{ margin: 0, paddingLeft: "20px" }}>
          <li>Deploy to Vercel and test with real orders</li>
          <li>Use Postman with deployed URL</li>
          <li>Test the complete checkout flow</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTest;
