import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Copy,
  CheckCircle,
  CreditCard,
  Building2,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";

const InternationalPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    orderSummary,
    customerDetails,
    finalAmount,
    currency,
    currencySymbol,
  } = location.state || {};

  const [copySuccess, setCopySuccess] = useState({});

  // HDFC Bank Details
  const bankDetails = {
    bankName: "HDFC Bank",
    accountName: "Chetna Bhati",
    accountNumber: "50100603672281", // Replace with actual account number
    ifscCode: "HDFC0001019", // Replace with actual IFSC code
    bankAddress: "Unnati Building, Plot No 23, Police Station Rd",
    branch: "Jogeshwari East, Mumbai, Maharashtra 400060", // Replace with actual branch
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess({ ...copySuccess, [field]: true });
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => {
        setCopySuccess({ ...copySuccess, [field]: false });
      }, 2000);
    });
  };

  const generateWhatsAppMessage = () => {
    const message = `Hi! I've placed an international order on Furever Steffie.

Order Details:
- Total Amount: ${currencySymbol}${finalAmount}
- Customer: ${customerDetails?.fullName}
- Email: ${customerDetails?.email}
- Phone: ${customerDetails?.mobileNumber}

I've made the payment via bank transfer. Please find the payment screenshot attached. Kindly proceed with my order.

Thank you!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppNotification = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/918821456667?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!orderSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order not found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              International Payment
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Payment Method Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Bank Transfer Required
              </h3>
              <p className="text-sm text-blue-700">
                We currently accept international payments via bank transfer
                only. Please use Remitly, Wise, or direct bank transfer to
                complete your payment.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            {orderSummary?.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Size: {item.selectedSize} • Qty: {item.quantity || 1}
                  </p>
                  {item.isRoyalSet && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                      👑 Royal Set
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900">
                  {currencySymbol}
                  {(item.price * (item.quantity || 1)).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {currencySymbol}
                  {orderSummary.subtotal}
                </span>
              </div>

              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -{currencySymbol}
                    {orderSummary.discount}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {currencySymbol}
                  {orderSummary.shipping}
                </span>
              </div>

              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {currencySymbol}
                  {finalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank Transfer Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {/* Bank Name */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Bank Name
                  </p>
                  <p className="font-medium text-gray-900">
                    {bankDetails.bankName}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(bankDetails.bankName, "Bank Name")
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copySuccess["Bank Name"] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Account Name */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Account Name
                  </p>
                  <p className="font-medium text-gray-900">
                    {bankDetails.accountName}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(bankDetails.accountName, "Account Name")
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copySuccess["Account Name"] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Account Number */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Account Number
                  </p>
                  <p className="font-medium text-gray-900 font-mono">
                    {bankDetails.accountNumber}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(bankDetails.accountNumber, "Account Number")
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copySuccess["Account Number"] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* IFSC Code */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    IFSC Code
                  </p>
                  <p className="font-medium text-gray-900 font-mono">
                    {bankDetails.ifscCode}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(bankDetails.ifscCode, "IFSC Code")
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copySuccess["IFSC Code"] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* SWIFT Code */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    SWIFT Code
                  </p>
                  <p className="font-medium text-gray-900 font-mono">
                    {bankDetails.swiftCode}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(bankDetails.swiftCode, "SWIFT Code")
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copySuccess["SWIFT Code"] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Bank Address */}
              <div className="flex justify-between items-start p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Bank Address
                  </p>
                  <p className="font-medium text-gray-900">
                    {bankDetails.bankAddress}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(bankDetails.bankAddress, "Bank Address")
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copySuccess["Bank Address"] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">
            Payment Instructions
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>
              • Transfer the exact amount:{" "}
              <strong>
                {currencySymbol}
                {finalAmount}
              </strong>
            </li>
            <li>• Use Remitly, Wise, or direct bank transfer</li>
            <li>• Keep the transfer receipt/screenshot</li>
            <li>• Notify us after payment via WhatsApp</li>
            <li>• Processing will begin once payment is confirmed</li>
          </ul>
        </div>

        {/* WhatsApp Notification Button */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Payment Completed?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you've made the payment, click below to notify us with your
            payment screenshot.
          </p>

          <button
            onClick={handleWhatsAppNotification}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Payment Made? Notify Us via WhatsApp
          </button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            This will open WhatsApp with a pre-filled message
          </p>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-gray-600">Name:</span>{" "}
              {customerDetails?.fullName}
            </p>
            <p>
              <span className="text-gray-600">Email:</span>{" "}
              {customerDetails?.email}
            </p>
            <p>
              <span className="text-gray-600">Phone:</span>{" "}
              {customerDetails?.mobileNumber}
            </p>
            <p>
              <span className="text-gray-600">Address:</span>{" "}
              {customerDetails?.addressLine1}
            </p>
            {customerDetails?.addressLine2 && (
              <p className="ml-12">{customerDetails.addressLine2}</p>
            )}
            <p className="ml-12">
              {customerDetails?.city}, {customerDetails?.state}{" "}
              {customerDetails?.pincode}
            </p>
            <p>
              <span className="text-gray-600">Country:</span>{" "}
              {customerDetails?.country?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalPaymentPage;
