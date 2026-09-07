import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Loader2 } from "lucide-react";
import {
  COURIER_OPTIONS,
  SHIPPING_TYPE_OPTIONS,
  getDeliveryEstimate,
} from "../utils/courierInfo";

const ShippedDetailsModal = ({ isOpen, order, defaultShippingType, onCancel, onConfirm, onShiprocketConfirm }) => {
  const [mode, setMode] = useState("shiprocket"); // "shiprocket" | "manual"

  // Manual entry state
  const [shippingType, setShippingType] = useState(defaultShippingType || "standard");
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingId, setTrackingId] = useState("");

  // Shiprocket state
  const [courierOptions, setCourierOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [shipping, setShipping] = useState(false);

  useEffect(() => {
    if (!isOpen || mode !== "shiprocket" || !order) return;

    const pincode = order.customer?.pincode;
    if (!pincode) {
      setOptionsError("This order has no delivery pincode on file.");
      return;
    }

    setLoadingOptions(true);
    setOptionsError("");
    fetch("/api/shiprocket-serviceability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deliveryPincode: pincode,
        items: (order.items || []).map((i) => ({ quantity: i.quantity || 1 })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message || "Failed to fetch courier options");
        setCourierOptions(data.options || []);
        if (data.options?.length) setSelectedCourierId(data.options[0].courierId);
      })
      .catch((err) => setOptionsError(err.message))
      .finally(() => setLoadingOptions(false));
  }, [isOpen, mode, order]);

  if (!isOpen) return null;

  const estimate = courierPartner ? getDeliveryEstimate(courierPartner, shippingType) : "";

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!courierPartner || !trackingId.trim()) return;
    onConfirm({
      shippingType,
      courierPartner,
      trackingId: trackingId.trim(),
      expectedDelivery: estimate,
    });
  };

  const handleShiprocketShip = async () => {
    if (!selectedCourierId) return;
    setShipping(true);
    try {
      await onShiprocketConfirm(selectedCourierId);
    } finally {
      setShipping(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Truck size={20} className="text-green-600" /> Shipment Details
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-2 mb-4 text-sm">
            <button
              type="button"
              onClick={() => setMode("shiprocket")}
              className={`px-3 py-1.5 rounded ${mode === "shiprocket" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Ship via Shiprocket
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`px-3 py-1.5 rounded ${mode === "manual" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Manual entry
            </button>
          </div>

          {mode === "shiprocket" ? (
            <div className="space-y-4">
              {loadingOptions && (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4 justify-center">
                  <Loader2 size={16} className="animate-spin" /> Fetching courier rates…
                </div>
              )}

              {optionsError && (
                <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2">
                  {optionsError}
                </div>
              )}

              {!loadingOptions && !optionsError && courierOptions.length === 0 && (
                <div className="text-xs text-gray-500">No couriers available for this pincode.</div>
              )}

              {!loadingOptions && courierOptions.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {courierOptions.map((opt, idx) => (
                    <label
                      key={opt.courierId}
                      className={`flex items-center justify-between border rounded px-3 py-2 text-sm cursor-pointer ${
                        selectedCourierId === opt.courierId ? "border-green-600 bg-green-50" : "border-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="courierOption"
                          checked={selectedCourierId === opt.courierId}
                          onChange={() => setSelectedCourierId(opt.courierId)}
                        />
                        {opt.courierName}
                        {idx === 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Cheapest</span>
                        )}
                      </span>
                      <span className="text-gray-500">
                        ₹{opt.price}{opt.etaDays ? ` · ${opt.etaDays}d` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedCourierId || shipping}
                  onClick={handleShiprocketShip}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {shipping && <Loader2 size={14} className="animate-spin" />}
                  Create Shipment & Notify Customer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Shipping Type
                </label>
                <select
                  value={shippingType}
                  onChange={(e) => setShippingType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {SHIPPING_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Courier Service
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select courier service</option>
                  {COURIER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tracking / AWB Number
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              {estimate && (
                <div className="text-xs bg-green-50 border border-green-200 text-green-700 rounded px-3 py-2">
                  Estimated delivery: <strong>{estimate}</strong>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm & Send Email
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShippedDetailsModal;
