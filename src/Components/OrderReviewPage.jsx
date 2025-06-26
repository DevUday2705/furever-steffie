import { AlertTriangle, ChevronLeft, Edit3, X } from "lucide-react";
import { useContext, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { convertCurrency } from "../constants/currency";
import { CurrencyContext } from "../context/currencyContext";

const OrderReviewPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get product selections from URL params or state management
  const location = useLocation();
  const orderDetails = location.state?.orderDetails || {};

  const [sizeConfirmed, setSizeConfirmed] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Destructure order details with fallbacks
  const {
    name = "",
    subcategory = "",
    isBeaded = true,
    isFullSet = false,
    selectedSize = "S",
    price = 0,
    image = "",
  } = orderDetails;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePlaceOrder = () => {
    if (!sizeConfirmed) {
      // Scroll to size section and highlight it
      const sizeSection = document.getElementById("size-confirmation");
      sizeSection.scrollIntoView({ behavior: "smooth" });
      sizeSection.classList.add("animate-pulse");
      setTimeout(() => {
        sizeSection.classList.remove("animate-pulse");
      }, 1500);
      return;
    }

    // Proceed with order placement
    // This would typically call an API or navigate to checkout
    navigate("/checkout", { state: { orderDetails, sizeConfirmed } });
  };
  const { currency } = useContext(CurrencyContext);
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-3">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-600"
          >
            <ChevronLeft size={18} />
            <span className="ml-1 text-sm">Back to Product</span>
          </button>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-3 pt-4 pb-16">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Review Your Order
        </h1>

        {/* Product Summary Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
          <div className="flex p-4">
            <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="text-xs font-medium text-gray-600">
                {subcategory}
              </div>
              <h2 className="text-lg font-bold text-gray-800">{name}</h2>
              <div className="mt-1 text-gray-700 text-lg font-semibold">
                {convertCurrency(price, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Options */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-md font-semibold text-gray-800">
              Selected Options
            </h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Style:</span>
              <span className="font-medium text-gray-800">
                {isBeaded ? "Hand Work" : "Simple"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Product Type:</span>
              <span className="font-medium text-gray-800">
                {isFullSet ? "Full Set" : "Kurta Only"}
              </span>
            </div>
          </div>
        </div>

        {/* Size Confirmation - Highlighted Section */}
        <div
          id="size-confirmation"
          className={`bg-white rounded-lg shadow-md overflow-hidden mb-5 ${
            !sizeConfirmed ? "ring-2 ring-yellow-400" : ""
          }`}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold text-gray-800">
                Size Confirmation
              </h3>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-xs font-medium text-gray-800 underline"
              >
                View Size Guide
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-gray-600">Selected Size:</span>
                <span className="ml-2 font-bold text-gray-800 text-lg">
                  {selectedSize}
                </span>
              </div>

              <button
                onClick={handleGoBack}
                className="text-xs font-medium text-gray-800 flex items-center"
              >
                <Edit3 size={14} className="mr-1" />
                Change
              </button>
            </div>

            {!sizeConfirmed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                <div className="flex">
                  <AlertTriangle
                    size={18}
                    className="text-yellow-600 flex-shrink-0 mt-0.5"
                  />
                  <div className="ml-2">
                    <p className="text-sm text-yellow-700 font-medium">
                      Please confirm your size selection
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      All pet outfits are custom made and we do not accept
                      returns or exchanges due to incorrect size selection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={sizeConfirmed}
                  onChange={() => setSizeConfirmed(!sizeConfirmed)}
                  className="mt-0.5 h-4 w-4 text-gray-800 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I confirm that I have checked the size guide and selected the
                  correct size for my pet. I understand that there are no
                  returns or exchanges for size issues.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-md font-semibold text-gray-800">
              Order Summary
            </h3>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Price:</span>
              <span className="text-gray-800">
                {convertCurrency(price, currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-800">
                {convertCurrency(49, currency)}
              </span>
            </div>

            <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold">
              <span className="text-gray-800">Total:</span>
              <span className="text-gray-800">
                {convertCurrency(price + 49, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Checkout Button */}
      <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
        <button
          onClick={handlePlaceOrder}
          className={`w-full py-3 font-medium rounded-md transition-all ${
            sizeConfirmed
              ? "bg-gray-800 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {sizeConfirmed ? "Confirm Order" : "Please Confirm Size Selection"}
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">Size Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Size
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Length (cm)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Chest (cm)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Neck (cm)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        XS
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        18-22
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        28-32
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        18-22
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        S
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        23-27
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        33-37
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        23-27
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        M
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        28-32
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        38-42
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        28-32
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        L
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        33-37
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        43-47
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        33-37
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        XL
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        38-42
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        48-52
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200">
                        38-42
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-800">
                  How to Measure
                </h4>
                <div className="mt-2 text-xs text-gray-600 space-y-2">
                  <p>
                    • <strong>Length:</strong> Measure from the base of the neck
                    to the start of the tail
                  </p>
                  <p>
                    • <strong>Chest:</strong> Measure the widest part of your
                    pet's chest
                  </p>
                  <p>
                    • <strong>Neck:</strong> Measure around the base of the neck
                    where the collar sits
                  </p>
                </div>

                <div className="mt-4 text-xs text-gray-600">
                  <p>
                    If your pet's measurements fall between two sizes, we
                    recommend selecting the larger size.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full py-2 bg-gray-800 text-white font-medium rounded-md"
              >
                Close Size Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReviewPage;
