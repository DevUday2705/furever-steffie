import { Play, VideoOff, Search, Save, CheckCircle } from "lucide-react";
import { useState } from "react";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

const SizeGuide = () => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({});
  const [savingMeasurements, setSavingMeasurements] = useState(false);

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "918828145667";
    const message =
      "Hi! I need help with taking my pet's measurements for the perfect fit. Can you guide me through the process?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const fetchOrder = async () => {
    if (!orderNumber.trim()) {
      toast.error("Please enter your order number");
      return;
    }

    setLoading(true);
    try {
      const searchTerm = orderNumber.trim();

      // Search for order by orderNumber field (e.g., "ORD-478542")
      const q = query(
        collection(db, "orders"),
        where("orderNumber", "==", searchTerm)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the first matching document
        const orderDoc = querySnapshot.docs[0];
        const orderData = { id: orderDoc.id, ...orderDoc.data() };
        setOrder(orderData);

        // Initialize measurements state
        const initialMeasurements = {};
        orderData.items?.forEach((item, index) => {
          initialMeasurements[index] = {
            neck: item.measurements?.neck || "",
            chest: item.measurements?.chest || "",
            back: item.measurements?.back || "",
          };
        });
        setMeasurements(initialMeasurements);

        toast.success("Order found! You can now update measurements");
      } else {
        // If not found by orderNumber, try searching by razorpay_order_id as fallback
        const fallbackQuery = query(
          collection(db, "orders"),
          where("razorpay_order_id", "==", searchTerm)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);

        if (!fallbackSnapshot.empty) {
          const orderDoc = fallbackSnapshot.docs[0];
          const orderData = { id: orderDoc.id, ...orderDoc.data() };
          setOrder(orderData);

          // Initialize measurements state
          const initialMeasurements = {};
          orderData.items?.forEach((item, index) => {
            initialMeasurements[index] = {
              neck: item.measurements?.neck || "",
              chest: item.measurements?.chest || "",
              back: item.measurements?.back || "",
            };
          });
          setMeasurements(initialMeasurements);

          toast.success("Order found! You can now update measurements");
        } else {
          toast.error(
            "Order not found. Please check your order number (e.g., ORD-478542)"
          );
          setOrder(null);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Error fetching order. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const updateMeasurement = (itemIndex, field, value) => {
    setMeasurements((prev) => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [field]: value,
      },
    }));
  };

  const saveMeasurements = async () => {
    if (!order) return;

    setSavingMeasurements(true);
    try {
      // Update the order with new measurements
      const updatedItems = order.items.map((item, index) => ({
        ...item,
        measurements: measurements[index] || item.measurements || {},
      }));

      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        items: updatedItems,
      });

      toast.success("✅ Measurements saved successfully!");

      // Update local order state
      setOrder((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } catch (error) {
      console.error("Error saving measurements:", error);
      toast.error("Error saving measurements. Please try again");
    } finally {
      setSavingMeasurements(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">
          📏 Size Guide & Measurements
        </h1>
        <p className="text-purple-100">
          Learn how to measure &amp; update your pet&apos;s measurements
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Video Tutorial Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            📹 How to Measure Your Pet
          </h2>

          <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
              </div>
            )}

            {videoError ? (
              <div className="aspect-video flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                <VideoOff size={48} className="mb-2" />
                <p className="text-sm">Video unavailable</p>
                <p className="text-xs mt-1">Please contact us for guidance</p>
              </div>
            ) : (
              <video
                className="w-full aspect-video object-cover"
                controls
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                poster="/images/video-thumbnail.jpg"
              >
                <source src="/images/measurement-guide.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Key Measurement Points:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Neck:</strong> Around the base of the neck where
                collar sits
              </li>
              <li>
                • <strong>Chest:</strong> Around the widest part of the chest
              </li>
              <li>
                • <strong>Back:</strong> From base of neck to base of tail
              </li>
            </ul>
          </div>
        </div>

        {/* Order Lookup Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🔍 Update Your Pet&apos;s Measurements
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Enter your order number (e.g., ORD-478542) to update measurements
              for your ordered items:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter order number (e.g., ORD-478542)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === "Enter" && fetchOrder()}
              />
              <button
                onClick={fetchOrder}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <Search size={16} />
                )}
                {loading ? "Searching..." : "Find Order"}
              </button>
            </div>
          </div>

          {/* Order Items & Measurements */}
          {order && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <h3 className="font-semibold text-green-800">Order Found!</h3>
                </div>
                <p className="text-sm text-green-700">
                  <strong>Customer:</strong> {order.customer?.fullName}
                  <br />
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                  <br />
                  <strong>Dispatch Date:</strong>{" "}
                  <span className="text-orange-600 font-semibold">
                    {order.dispatchDate
                      ? new Date(order.dispatchDate).toLocaleDateString()
                      : "Not set"}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Update Measurements for Your Items:
                </h3>

                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex gap-3 mb-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.subcategory} • Size {item.selectedSize}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Neck (cm)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={measurements[index]?.neck || ""}
                          onChange={(e) =>
                            updateMeasurement(index, "neck", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Chest (cm)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={measurements[index]?.chest || ""}
                          onChange={(e) =>
                            updateMeasurement(index, "chest", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Back (cm)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={measurements[index]?.back || ""}
                          onChange={(e) =>
                            updateMeasurement(index, "back", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={saveMeasurements}
                  disabled={savingMeasurements}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingMeasurements ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save All Measurements
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Measurement Guide Image */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
            📐 Visual Measurement Guide
          </h2>
          <div className="bg-gray-100 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            <img
              src="/images/size-chart.jpg"
              alt="Pet Measurement Guide"
              className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div className="hidden">
              <div className="text-6xl mb-4">📐</div>
              <p className="text-gray-600">Measurement Guide Image</p>
              <p className="text-sm text-gray-500 mt-2">
                Add your measurement guide image to
                /public/images/size-chart.jpg
              </p>
            </div>
          </div>
        </div>

        {/* Measurement Instructions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            We Need Just 3 Simple Measurements
          </h2>

          <div className="space-y-4">
            {/* Neck Circumference */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold text-purple-800 mb-1">
                  1. Neck Circumference
                </h3>
                <p className="text-gray-700 text-sm">
                  Measure around the base of your pet&apos;s neck where the
                  collar sits naturally.
                </p>
              </div>
            </div>

            {/* Chest Circumference */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl">📏</div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">
                  2. Chest Circumference
                </h3>
                <p className="text-gray-700 text-sm">
                  Measure around the widest part of your pet&apos;s chest, just
                  behind the front legs.
                </p>
              </div>
            </div>

            {/* Back Length */}
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl">📐</div>
              <div>
                <h3 className="font-semibold text-green-800 mb-1">
                  3. Back Length (Collar to Tail)
                </h3>
                <p className="text-gray-700 text-sm">
                  Measure from the base of the neck (where collar sits) to the
                  base of the tail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            📹 Watch Our Measurement Tutorial
          </h3>

          <div className="bg-gray-100 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            {/* Video Container with 4:5 Aspect Ratio */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Aspect Ratio Container */}
              <div
                className="relative w-full"
                style={{ paddingBottom: "125%" }}
              >
                {!videoError ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                    controls
                    poster="/images/thumbnail.avif"
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoad}
                    preload="metadata"
                  >
                    <source src="/images/measurements.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Fallback content when video fails to load
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 rounded-lg shadow-md">
                    <VideoOff className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 text-sm mb-2">
                      Video not available
                    </p>
                    <p className="text-xs text-gray-500 px-4">
                      The measurement tutorial video is currently unavailable.
                      Please check back later or contact support.
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {isLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                    <div className="flex flex-col items-center">
                      <Play className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <p className="text-sm text-gray-600 mt-4">
              Learn the proper techniques for taking accurate measurements
            </p>
          </div>
        </div>

        {/* Important Tips */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            💡 Pro Tips for Accurate Measurements
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use a flexible measuring tape for best results</li>
            <li>• Keep your pet standing in a natural position</li>
            <li>
              • Add 2-3 cm for comfort (we&apos;ll adjust for perfect fit)
            </li>
            <li>• Take measurements when your pet is calm and relaxed</li>
          </ul>
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">
              Need Help with Measurements?
            </h3>
            <p className="text-green-100 text-sm mb-4">
              Our experts are here to guide you through the process
            </p>

            <button
              onClick={handleWhatsAppClick}
              className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center gap-2 mx-auto"
            >
              <span className="text-xl">📱</span>
              Message us on WhatsApp
            </button>

            <p className="text-green-100 text-xs mt-3">
              WhatsApp: +91 88281 45667
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Once you have the measurements, our team will create the perfect fit
            for your pet! 🐾
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
