import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Edit3,
  Trash2,
  Package,
  Search,
  Filter,
  Camera,
} from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { uploadToCloudinary } from "../constants/uploadToCloudinary";

const StockManager = () => {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState("all");
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    imageFile: null,
    imagePreview: "",
    sizes: { XS: 0, S: 0, M: 0, L: 0 },
    fabric: "",
    createdAt: null,
  });

  const sizes = ["XS", "S", "M", "L"];

  useEffect(() => {
    // Use real-time listener instead of one-time fetch
    const unsubscribe = onSnapshot(
      collection(db, "stock"),
      (snapshot) => {
        const stockList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(stockList);
      },
      (error) => {
        console.error("Failed to fetch stock:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const addItemToFirebase = async (item) => {
    try {
      let imageUrl = null;

      // Upload image to Cloudinary if there's a file
      if (item.imageFile) {
        imageUrl = await uploadToCloudinary(item.imageFile);
      }

      // Save to Firebase with Cloudinary URL
      await addDoc(collection(db, "stock"), {
        name: item.name,
        image: imageUrl,
        sizes: item.sizes,
        fabric: item.fabric,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  const updateItemInFirebase = async (id, updates) => {
    try {
      const itemRef = doc(db, "stock", id);

      // If there's a new image file, upload it to Cloudinary
      if (updates.imageFile) {
        const imageUrl = await uploadToCloudinary(updates.imageFile);
        updates.image = imageUrl;
        delete updates.imageFile; // Remove file object before saving to Firebase
      }

      await updateDoc(itemRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const deleteItemFromFirebase = async (id) => {
    try {
      const itemRef = doc(db, "stock", id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;

    setLoading(true);
    try {
      await addItemToFirebase(newItem);

      // Clean up preview URL to avoid memory leaks
      if (newItem.imagePreview) {
        URL.revokeObjectURL(newItem.imagePreview);
      }

      setNewItem({
        name: "",
        imageFile: null,
        imagePreview: "",
        sizes: { XS: 0, S: 0, M: 0, L: 0 },
        fabric: "",
        createdAt: null,
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (itemId, size, change) => {
    try {
      const item = items.find((itm) => itm.id === itemId);
      if (!item) {
        console.error("Item not found:", itemId);
        return;
      }

      const currentStock = item.sizes[size] || 0;
      const newStock = Math.max(0, currentStock + change);

      const updatedSizes = {
        ...item.sizes,
        [size]: newStock,
      };

      await updateItemInFirebase(itemId, { sizes: updatedSizes });
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      if (window.confirm("Are you sure you want to delete this item?")) {
        await deleteItemFromFirebase(itemId);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleEditItem = async (updatedItem) => {
    setLoading(true);
    try {
      await updateItemInFirebase(updatedItem.id, {
        name: updatedItem.name,
        fabric: updatedItem.fabric,
        sizes: updatedItem.sizes,
        ...(updatedItem.imageFile && { imageFile: updatedItem.imageFile }),
      });

      // Clean up preview URL if it exists
      if (
        updatedItem.imagePreview &&
        updatedItem.imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(updatedItem.imagePreview);
      }

      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);

      if (isEditing) {
        setEditingItem((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: previewUrl,
        }));
      } else {
        setNewItem((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: previewUrl,
        }));
      }
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fabric?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize =
      selectedSize === "all" || (item.sizes && item.sizes[selectedSize] > 0);
    return matchesSearch && matchesSize;
  });

  const getTotalStock = (item) =>
    item.sizes
      ? Object.values(item.sizes).reduce((sum, count) => sum + count, 0)
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl border border-white/20"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pet Clothes Stock
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your furry fashion inventory
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Item
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg border border-white/20"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search items or fabric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                layout
                exit="exit"
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative mb-4">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop"
                    }
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Package className="text-purple-600" size={16} />
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.fabric}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Total Stock</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getTotalStock(item)}
                    </span>
                  </div>
                </div>

                {/* Size Management */}
                <div className="space-y-3">
                  {sizes.map((size) => (
                    <div
                      key={size}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-700 w-6">
                          {size}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.sizes?.[size] || 0} units
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateStock(item.id, size, -1)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-lg transition-colors"
                          disabled={(item.sizes?.[size] || 0) === 0}
                        >
                          <Minus size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateStock(item.id, size, 1)}
                          className="bg-green-100 hover:bg-green-200 text-green-600 p-1.5 rounded-lg transition-colors"
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setEditingItem({
                        ...item,
                        imageFile: null,
                        imagePreview: item.image,
                      })
                    }
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Add Item Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !loading && setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Add New Item
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter product name"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fabric
                    </label>
                    <input
                      type="text"
                      value={newItem.fabric}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          fabric: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Cotton, Wool, Polyester"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Upload
                    </label>
                    <div className="relative">
                      <Camera
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        disabled={loading}
                      />
                    </div>
                    {newItem.imagePreview && (
                      <div className="mt-3">
                        <img
                          src={newItem.imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Initial Stock by Size
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {sizes.map((size) => (
                        <div key={size}>
                          <label className="block text-xs text-gray-600 mb-1">
                            {size}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={newItem.sizes[size]}
                            onChange={(e) =>
                              setNewItem((prev) => ({
                                ...prev,
                                sizes: {
                                  ...prev.sizes,
                                  [size]: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={handleAddItem}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    disabled={loading || !newItem.name.trim()}
                  >
                    {loading ? "Adding..." : "Add Item"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Item Modal */}
        <AnimatePresence>
          {editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !loading && setEditingItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Edit Item
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) =>
                        setEditingItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter product name"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fabric
                    </label>
                    <input
                      type="text"
                      value={editingItem.fabric}
                      onChange={(e) =>
                        setEditingItem((prev) => ({
                          ...prev,
                          fabric: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Cotton, Wool, Polyester"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Image (optional)
                    </label>
                    <div className="relative">
                      <Camera
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        disabled={loading}
                      />
                    </div>
                    {editingItem.imagePreview && (
                      <div className="mt-3">
                        <img
                          src={editingItem.imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Stock by Size
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {sizes.map((size) => (
                        <div key={size}>
                          <label className="block text-xs text-gray-600 mb-1">
                            {size}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editingItem.sizes?.[size] || 0}
                            onChange={(e) =>
                              setEditingItem((prev) => ({
                                ...prev,
                                sizes: {
                                  ...prev.sizes,
                                  [size]: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={() => setEditingItem(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={() => handleEditItem(editingItem)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Item"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedSize !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first pet clothing item"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StockManager;
