import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, Check } from "lucide-react";

import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { uploadToCloudinary } from "../constants/uploadToCloudinary";

export default function FabricManagementSystem() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [fabrics, setFabrics] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    purchasedDate: "",
    purchasedFrom: "",
    notes: "",
    availableMeters: "",
    image: null,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      purchasedDate: "",
      purchasedFrom: "",
      notes: "",
      availableMeters: "",
      image: null,
    });
    setPreviewImage(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, image: file });
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = null;

      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      const newFabric = {
        name: formData.name,
        price: parseFloat(formData.price),
        availableMeters: parseFloat(formData.availableMeters),
        purchasedDate: formData.purchasedDate,
        purchasedFrom: formData.purchasedFrom,
        notes: formData.notes,
        image: imageUrl,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "fabrics"), newFabric);

      fetchFabrics(); // Refresh list
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding fabric:", error);
      alert("Something went wrong. Try again.");
    }
  };
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const fetchFabrics = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "fabrics"));
      const fabricList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFabrics(fabricList);
    } catch (error) {
      console.error("Failed to fetch fabrics:", error);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 font-sans text-gray-800">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">Fabric Inventory</h1>
        <p className="text-indigo-700 mt-2">
          Manage your dog clothes fabrics with ease
        </p>
      </header>

      {/* Fab Button */}
      <motion.button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Fabrics List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fabrics.map((fabric) => (
          <motion.div
            key={fabric.id}
            className="bg-white rounded-xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-40 bg-gray-200 relative">
              {fabric.image ? (
                <img
                  src={fabric.image}
                  alt={fabric.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-indigo-900">
                  {fabric.name}
                </h3>
                <span className="text-indigo-600 font-semibold">
                  ${fabric.price}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Available:</span>{" "}
                  {fabric.availableMeters} meters
                </p>
                <p>
                  <span className="font-medium">Purchased:</span>{" "}
                  {fabric.purchasedDate}
                </p>
                <p>
                  <span className="font-medium">From:</span>{" "}
                  {fabric.purchasedFrom}
                </p>
              </div>
              {fabric.notes && (
                <p className="mt-2 text-sm text-gray-500 italic">
                  {fabric.notes}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {fabrics.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-indigo-100">
            <Upload size={32} className="text-indigo-500" />
          </div>
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">
            No fabrics yet
          </h2>
          <p className="text-indigo-600 mb-6">
            Start adding your fabrics to manage inventory
          </p>
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} className="mr-1" />
            Add Your First Fabric
          </motion.button>
        </motion.div>
      )}

      {/* Add Fabric Slide-in Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full md:w-96 h-full overflow-y-auto shadow-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-bold text-indigo-900">
                  Add New Fabric
                </h2>
                <motion.button
                  onClick={() => setShowAddForm(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="p-4 space-y-5">
                {/* Image Upload */}
                <div
                  onClick={handleImageClick}
                  className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    name="image"
                  />

                  {previewImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload
                        size={24}
                        className="mx-auto text-indigo-500 mb-2"
                      />
                      <p className="text-indigo-600 font-medium">
                        Upload Image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click to select
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Cotton Twill"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="12.99"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available (m)
                      </label>
                      <input
                        type="number"
                        name="availableMeters"
                        value={formData.availableMeters}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="5"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchased Date
                    </label>
                    <input
                      type="date"
                      name="purchasedDate"
                      value={formData.purchasedDate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchased From
                    </label>
                    <input
                      type="text"
                      name="purchasedFrom"
                      value={formData.purchasedFrom}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Fabric Supplier Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-24"
                      placeholder="Add any additional details about this fabric..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg mt-6 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={18} className="mr-2" />
                  Save Fabric
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Count and Stats */}
      {fabrics.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-indigo-900">Inventory Summary</h3>
            <span className="bg-indigo-100 text-indigo-800 text-sm py-1 px-3 rounded-full">
              {fabrics.length} Fabrics
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-700">Total Value</p>
              <p className="text-xl font-bold text-indigo-900">
                $
                {fabrics
                  .reduce((sum, fabric) => sum + Number(fabric.price), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-700">Total Meters</p>
              <p className="text-xl font-bold text-indigo-900">
                {fabrics
                  .reduce(
                    (sum, fabric) => sum + Number(fabric.availableMeters),
                    0
                  )
                  .toFixed(1)}
                m
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
