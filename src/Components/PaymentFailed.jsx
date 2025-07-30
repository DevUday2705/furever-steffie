import React from "react";
import { XCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";

const PaymentFailed = () => {
  // In a real implementation, you would use:
  // const navigate = useNavigate();
  // const [searchParams] = useSearchParams();

  // For demo purposes, using static values
  const errorCode = "CARD_DECLINED"; // This would come from searchParams.get('error_code');
  const errorDescription = "Your card was declined by the bank"; // searchParams.get('error_description');
  const orderId = "ORD_123456789"; // searchParams.get('order_id');

  const getErrorMessage = (code) => {
    const errorMessages = {
      BAD_REQUEST_ERROR: "Invalid payment request. Please try again.",
      GATEWAY_ERROR: "Payment gateway error. Please try again.",
      NETWORK_ERROR:
        "Network connection failed. Please check your internet connection.",
      SERVER_ERROR: "Server error occurred. Please try again later.",
      USER_CANCELLED: "Payment was cancelled by user.",
      INSUFFICIENT_FUNDS: "Insufficient funds in your account.",
      INVALID_CARD: "Invalid card details. Please check and try again.",
      CARD_DECLINED:
        "Your card was declined. Please try a different payment method.",
      EXPIRED_CARD: "Your card has expired. Please use a different card.",
      TRANSACTION_TIMEOUT: "Transaction timed out. Please try again.",
    };

    return errorMessages[code] || "Payment failed due to an unknown error.";
  };

  const handleRetryPayment = () => {
    // In a real implementation:
    // navigate('/checkout', {
    //   state: {
    //     retryPayment: true,
    //     orderId: orderId
    //   }
    // });
    console.log("Redirecting to checkout for retry...");
  };

  const handleGoHome = () => {
    // In a real implementation:
    // navigate('/');
    console.log("Redirecting to home...");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            {errorCode
              ? getErrorMessage(errorCode)
              : "We encountered an issue processing your payment. Please try again."}
          </p>

          {/* Order ID (if available) */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono text-sm text-gray-800">{orderId}</p>
            </div>
          )}

          {/* Error Details (if available) */}
          {errorDescription && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">
                <strong>Error Details:</strong> {errorDescription}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Payment</span>
            </button>

            <button
              onClick={handleGoBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <button
              onClick={handleGoHome}
              className="w-full text-indigo-600 hover:text-indigo-800 font-medium py-2 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Check your internet connection</p>
            <p>• Verify your card details</p>
            <p>• Try a different payment method</p>
            <p>• Contact your bank if the issue persists</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Still having trouble? Contact our support team at{" "}
              <a
                href="mailto:support@fureversteffie.com"
                className="text-indigo-600 hover:text-indigo-800"
              >
                support@fureversteffie.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
