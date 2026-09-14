import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Plus,
  Minus,
  Save,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Loader,
  Calendar,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DHOTI_SIZES } from "../utils/dhotiInventoryUtils";

const META_KEYS = ["lastUpdated", "updatedBy"];

const slugify = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const emptyStock = () =>
  DHOTI_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {});

// The single admin page for dhoti data: colors, per-size stock, and photos.
// This is the only place any of that gets edited - the product page, cart,
// checkout, and order records all read from the same `dhotis/inventory` doc
// this page writes to.
const DhotiManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState({});
  const [originalInventory, setOriginalInventory] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editMode, setEditMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDhoti, setNewDhoti] = useState({ name: "", image: "" });

  useEffect(() => {
    fetchDhotiInventory();
  }, []);

  const fetchDhotiInventory = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "dhotis", "inventory");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setInventory(data);
        setOriginalInventory(data);
        setLastUpdated(data.lastUpdated || null);
      } else {
        const defaultInventory = { lastUpdated: new Date().toISOString() };
        await setDoc(docRef, defaultInventory);
        setInventory(defaultInventory);
        setOriginalInventory(defaultInventory);
      }
    } catch (error) {
      console.error("Error fetching dhoti inventory:", error);
      showMessage("error", "Error loading dhoti inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const dhotiIds = Object.keys(inventory).filter((k) => !META_KEYS.includes(k));

  const updateQuantity = (dhotiId, size, change) => {
    setInventory((prev) => {
      const currentStock = prev[dhotiId]?.inventory[size] || 0;
      const newStock = Math.max(0, currentStock + change);
      return {
        ...prev,
        [dhotiId]: {
          ...prev[dhotiId],
          inventory: { ...prev[dhotiId].inventory, [size]: newStock },
        },
      };
    });
  };

  const setQuantity = (dhotiId, size, quantity) => {
    const numQuantity = Math.max(0, parseInt(quantity) || 0);
    setInventory((prev) => ({
      ...prev,
      [dhotiId]: {
        ...prev[dhotiId],
        inventory: { ...prev[dhotiId].inventory, [size]: numQuantity },
      },
    }));
  };

  const setDhotiField = (dhotiId, field, value) => {
    setInventory((prev) => ({
      ...prev,
      [dhotiId]: { ...prev[dhotiId], [field]: value },
    }));
  };

  const addDhoti = () => {
    const name = newDhoti.name.trim();
    if (!name) {
      showMessage("error", "Give the new dhoti a name first.");
      return;
    }
    const id = slugify(name);
    if (!id || inventory[id]) {
      showMessage("error", "A dhoti with that name already exists (or the name is invalid).");
      return;
    }

    setInventory((prev) => ({
      ...prev,
      [id]: {
        id,
        name,
        image: newDhoti.image.trim(),
        inventory: emptyStock(),
      },
    }));
    setNewDhoti({ name: "", image: "" });
    setShowAddForm(false);
  };

  const removeDhoti = (dhotiId) => {
    if (!window.confirm(`Remove "${inventory[dhotiId]?.name}" permanently? This can't be undone once saved.`)) {
      return;
    }
    setInventory((prev) => {
      const next = { ...prev };
      delete next[dhotiId];
      return next;
    });
  };

  const saveInventory = async () => {
    try {
      setSaving(true);
      const updatedInventory = {
        ...inventory,
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin",
      };

      await setDoc(doc(db, "dhotis", "inventory"), updatedInventory);
      setInventory(updatedInventory);
      setOriginalInventory(updatedInventory);
      setLastUpdated(updatedInventory.lastUpdated);
      setEditMode(false);

      showMessage("success", "Dhoti inventory updated successfully!");
    } catch (error) {
      console.error("Error saving inventory:", error);
      showMessage("error", "Error saving inventory. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setInventory(originalInventory);
    setEditMode(false);
    setShowAddForm(false);
  };

  const hasChanges = () => JSON.stringify(inventory) !== JSON.stringify(originalInventory);

  const getTotalStock = (dhotiId) => {
    if (!inventory[dhotiId]) return 0;
    return Object.values(inventory[dhotiId].inventory || {}).reduce(
      (sum, stock) => sum + (stock || 0),
      0
    );
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: "out", color: "text-red-600 bg-red-50", label: "Out of Stock" };
    if (stock <= 3) return { status: "low", color: "text-yellow-600 bg-yellow-50", label: "Low Stock" };
    return { status: "good", color: "text-green-600 bg-green-50", label: "In Stock" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 h-8 w-8 text-gray-600" />
          <p className="text-gray-600">Loading dhoti inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="h-6 w-6 mr-2" />
                  Dhoti Inventory
                </h1>
                <p className="text-gray-600 text-sm">
                  The single source of truth for dhoti colors, sizes and stock -
                  every kurta's Complete Set / Royal Set option reads from here.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasChanges() && (
                <motion.button
                  onClick={resetChanges}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Changes
                </motion.button>
              )}

              {editMode ? (
                <motion.button
                  onClick={saveInventory}
                  disabled={saving || !hasChanges()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    saving || !hasChanges()
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setEditMode(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-black text-white rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Inventory</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Message Display */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add new dhoti */}
        {editMode && (
          <div className="mb-6">
            {showAddForm ? (
              <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maroon"
                    value={newDhoti.name}
                    onChange={(e) => setNewDhoti((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-[2] min-w-[220px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newDhoti.image}
                    onChange={(e) => setNewDhoti((p) => ({ ...p, image: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={addDhoti}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDhoti({ name: "", image: "" });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Dhoti Color
              </button>
            )}
          </div>
        )}

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dhotiIds.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">
              No dhotis configured yet. Click "Add New Dhoti Color" above to create one.
            </p>
          )}
          {dhotiIds.map((dhotiId, index) => {
            const dhotiData = inventory[dhotiId];
            const totalStock = getTotalStock(dhotiId);

            return (
              <motion.div
                key={dhotiId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {dhotiData?.image ? (
                        <img
                          src={dhotiData.image}
                          alt={dhotiData.name}
                          className="w-10 h-10 rounded-lg object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        {editMode ? (
                          <input
                            type="text"
                            value={dhotiData?.name || ""}
                            onChange={(e) => setDhotiField(dhotiId, "name", e.target.value)}
                            className="font-semibold text-gray-900 border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          <h3 className="font-semibold text-gray-900 truncate">{dhotiData?.name} Dhoti</h3>
                        )}
                        <p className="text-sm text-gray-600">Total Stock: {totalStock}</p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs shrink-0 ${getStockStatus(totalStock).color}`}>
                      {getStockStatus(totalStock).label}
                    </div>
                  </div>

                  {editMode && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={dhotiData?.image || ""}
                        onChange={(e) => setDhotiField(dhotiId, "image", e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => removeDhoti(dhotiId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                        title="Remove this dhoti"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Size Inventory */}
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DHOTI_SIZES.map((size) => {
                      const stock = dhotiData?.inventory?.[size] || 0;
                      const stockInfo = getStockStatus(stock);

                      return (
                        <div
                          key={size}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700 w-10 text-sm">{size}</span>
                            <div className={`px-2 py-0.5 rounded text-xs ${stockInfo.color}`}>
                              {stock}
                            </div>
                          </div>

                          {editMode ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => updateQuantity(dhotiId, size, -1)}
                                disabled={stock === 0}
                                className={`p-1 rounded transition-colors ${
                                  stock === 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50"
                                }`}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setQuantity(dhotiId, size, e.target.value)}
                                className="w-12 px-1 py-0.5 text-center text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />

                              <button
                                onClick={() => updateQuantity(dhotiId, size, 1)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dhotiIds.reduce((total, id) => total + getTotalStock(id), 0)}
              </div>
              <div className="text-sm text-blue-700">Total Units</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dhotiIds.filter((id) => getTotalStock(id) > 3).length}
              </div>
              <div className="text-sm text-green-700">Well Stocked</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {dhotiIds.filter((id) => getTotalStock(id) > 0 && getTotalStock(id) <= 3).length}
              </div>
              <div className="text-sm text-yellow-700">Low Stock</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {dhotiIds.filter((id) => getTotalStock(id) === 0).length}
              </div>
              <div className="text-sm text-red-700">Out of Stock</div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        {lastUpdated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DhotiManagement;
