import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const WhatsAppTester = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const sendTestMessage = async () => {
    if (!mobileNumber) {
      toast.error("Please enter a mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber,
          customMessage: customMessage || undefined,
        }),
      });

      // Check if the response is ok first
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }

      setLastResult(result);

      if (result.success) {
        toast.success("WhatsApp message sent successfully!");
      } else {
        toast.error(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error(`Error: ${error.message}`);
      setLastResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📱 WhatsApp Integration Tester
          </h1>

          <div className="space-y-6">
            {/* Mobile Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number (e.g., 9876543210)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit Indian mobile number. Country code will be added
                automatically.
              </p>
            </div>

            {/* Custom Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Leave empty to use default test message..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendTestMessage}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Sending..." : "📤 Send Test WhatsApp"}
            </motion.button>

            {/* Result Display */}
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`p-4 rounded-lg border ${
                  lastResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <h3
                  className={`font-medium mb-2 ${
                    lastResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {lastResult.success ? "✅ Success" : "❌ Failed"}
                </h3>

                <div className="text-sm space-y-1">
                  <p>
                    <strong>Message:</strong> {lastResult.message}
                  </p>
                  {lastResult.formattedNumber && (
                    <p>
                      <strong>Formatted Number:</strong> +
                      {lastResult.formattedNumber}
                    </p>
                  )}
                  {lastResult.error && (
                    <p className="text-red-600">
                      <strong>Error:</strong> {JSON.stringify(lastResult.error)}
                    </p>
                  )}
                  {lastResult.result && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600">
                        API Response
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(lastResult.result, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </motion.div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">
                ℹ️ Testing Instructions
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use your own mobile number for testing</li>
                <li>• WhatsApp messages will be sent to the entered number</li>
                <li>• Check your WhatsApp to verify message delivery</li>
                <li>
                  • Messages are sent from business number: +91 88281 45667
                </li>
                <li>• MSG91 Auth Key: 464925AYkG1psqH0oB68a22c76P1</li>
              </ul>

              <div className="mt-3 pt-3 border-t border-blue-200">
                <a
                  href="/whatsapp-info"
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                >
                  📋 View Integration Setup Guide
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WhatsAppTester;
