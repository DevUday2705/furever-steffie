import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { motion } from "framer-motion";
export default function FabricDetailSlider({ fabric, onClose, onUpdated }) {
  const [available, setAvailable] = useState(fabric?.availableMeters || 0);
  const [saving, setSaving] = useState(false);

  if (!fabric) return null;

  const handleSave = async () => {
    const delta = parseFloat(available) - parseFloat(fabric.availableMeters);
    if (delta === 0) return;

    setSaving(true);
    try {
      const docRef = doc(db, "fabrics", fabric.id);
      const newLog = {
        date: new Date().toISOString(),
        change: delta,
        updatedTo: available,
      };

      await updateDoc(docRef, {
        availableMeters: available,
        logs: arrayUnion(newLog),
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-full md:w-96 h-full p-4 overflow-y-auto shadow-lg"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-indigo-800">Fabric Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Image */}
        <div className="mt-4 w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          {fabric.image ? (
            <img
              src={fabric.image}
              alt={fabric.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <b>ID:</b> {fabric.fabricId}
          </p>
          <p>
            <b>Name:</b> {fabric.name}
          </p>
          <p>
            <b>Price:</b> ${fabric.price}
          </p>
          <p>
            <b>Purchased From:</b> {fabric.purchasedFrom}
          </p>
          <p>
            <b>Date:</b> {fabric.purchasedDate}
          </p>
          <p>
            <b>Notes:</b> {fabric.notes}
          </p>
        </div>

        {/* Update Available Meters */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available (meters)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAvailable((prev) => Math.max(0, prev - 0.5))}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>
            <input
              type="number"
              value={available}
              onChange={(e) => setAvailable(parseFloat(e.target.value))}
              className="w-24 text-center p-2 border border-gray-300 rounded"
              step="0.1"
              min="0"
            />
            <button
              onClick={() => setAvailable((prev) => prev + 0.5)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          {saving ? "Saving..." : "Update Fabric"}
        </button>

        {/* Logs */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-indigo-700 mb-2">
            Update Logs
          </h3>
          <div className="space-y-2 text-xs text-gray-700">
            {fabric.logs?.length > 0 ? (
              fabric.logs
                .slice()
                .reverse()
                .map((log, i) => (
                  <div key={i} className="p-2 bg-gray-100 rounded">
                    <p>
                      <b>Changed:</b> {log.change > 0 ? "+" : ""}
                      {log.change} meters
                    </p>
                    <p>
                      <b>New Total:</b> {log.updatedTo} meters
                    </p>
                    <p>
                      <b>Date:</b> {new Date(log.date).toLocaleString()}
                    </p>
                  </div>
                ))
            ) : (
              <p>No changes yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
