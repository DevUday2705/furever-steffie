import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck } from "lucide-react";
import {
  COURIER_OPTIONS,
  SHIPPING_TYPE_OPTIONS,
  getDeliveryEstimate,
} from "../utils/courierInfo";

const ShippedDetailsModal = ({ isOpen, defaultShippingType, onCancel, onConfirm }) => {
  const [shippingType, setShippingType] = useState(defaultShippingType || "standard");
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingId, setTrackingId] = useState("");

  if (!isOpen) return null;

  const estimate = courierPartner ? getDeliveryEstimate(courierPartner, shippingType) : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courierPartner) {
      return;
    }
    if (!trackingId.trim()) {
      return;
    }
    onConfirm({
      shippingType,
      courierPartner,
      trackingId: trackingId.trim(),
      expectedDelivery: estimate,
    });
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShippedDetailsModal;
