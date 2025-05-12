import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Upload,
  Check,
  Search,
  Save,
  Minus,
  History,
  Calendar,
  ShoppingBag,
  Image,
  Info,
  Tag,
  StickyNote,
  Filter,
  Trash2,
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { uploadToCloudinary } from "../constants/uploadToCloudinary";
import toast from "react-hot-toast";

export default function FabricManagementSystem() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [fabrics, setFabrics] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [sortBy, setSortBy] = useState(""); // "", "low", "high"
  const [priceRanges, setPriceRanges] = useState([]); // e.g. [ [100,150], [200,250] ]
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
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
  async function generateUniqueFabricId() {
    let unique = false;
    let fabricId;

    while (!unique) {
      fabricId = Math.floor(1000 + Math.random() * 9000); // 4-digit ID

      const snapshot = await getDocs(collection(db, "fabrics"));
      const existing = snapshot.docs.find(
        (doc) => doc.data().fabricId === fabricId
      );
      if (!existing) unique = true;
    }

    return fabricId;
  }
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

      const fabricId = await generateUniqueFabricId(); // new line

      const newFabric = {
        fabricId, // add this
        name: formData.name,
        price: parseFloat(formData.price),
        availableMeters: parseFloat(formData.availableMeters),
        purchasedDate: formData.purchasedDate,
        purchasedFrom: formData.purchasedFrom,
        notes: formData.notes,
        image: imageUrl,
        createdAt: new Date().toISOString(),
        logs: [], // for future logs
      };

      await addDoc(collection(db, "fabrics"), newFabric);

      fetchFabrics();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding fabric:", error);
    }
  };
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const fetchFabrics = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "fabrics"));
      const fabricList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // ✅ Ensure this line is present
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

  const filteredFabrics = fabrics
    .filter((fabric) => {
      const nameMatch = fabric.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const idMatch = fabric.fabricId?.toString().includes(searchTerm);
      const locationMatch =
        selectedLocations.length === 0 ||
        selectedLocations.includes(fabric.purchasedFrom);
      const priceMatch =
        priceRanges.length === 0 ||
        priceRanges.some(([min, max]) =>
          max === "300+"
            ? fabric.price >= min
            : fabric.price >= min && fabric.price <= max
        );

      return (nameMatch || idMatch) && locationMatch && priceMatch;
    })
    .sort((a, b) => {
      if (sortBy === "low") return a.price - b.price;
      if (sortBy === "high") return b.price - a.price;
      return 0;
    });

  const allLocations = [...new Set(fabrics.map((f) => f.purchasedFrom))];
  const locationCounts = allLocations.map((loc) => ({
    name: loc,
    count: fabrics.filter((f) => f.purchasedFrom === loc).length,
  }));

  return (
    <div className="min-h-screen  p-4 font-sans text-gray-800">
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

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or ID..."
          className="w-full p-3 pl-10 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button
        className="flex ml-auto my-5 font-semibold border px-4 py-1.5 rounded-md gap-4 items-center"
        onClick={() => setFilterOpen((prev) => !prev)}
      >
        <Filter size={18} /> Filters
      </button>
      {filterOpen && (
        <div className="mb-6 space-y-4 text-sm">
          {/* Sort */}
          <div>
            <label className="block font-medium mb-1">Sort by Price</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Default</option>
              <option value="low">Low to High</option>
              <option value="high">High to Low</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block font-medium mb-1">Price Range</label>
            {[
              [50, 100],
              [100, 150],
              [150, 200],
              [200, 250],
              [250, 300],
              [300, "300+"],
            ].map(([min, max], i) => {
              const label = max === "300+" ? "300+" : `${min}–${max}`;
              const isChecked = priceRanges.some(
                (r) => r[0] === min && r[1] === max
              );

              return (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setPriceRanges((prev) =>
                        isChecked
                          ? prev.filter((r) => r[0] !== min || r[1] !== max)
                          : [...prev, [min, max]]
                      );
                    }}
                  />
                  <label>{label}</label>
                </div>
              );
            })}
          </div>

          {/* Purchased From */}
          <div>
            <label className="block font-medium mb-1">Purchased From</label>
            {locationCounts.map(({ name, count }, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(name)}
                  onChange={() => {
                    setSelectedLocations((prev) =>
                      prev.includes(name)
                        ? prev.filter((loc) => loc !== name)
                        : [...prev, name]
                    );
                  }}
                />
                <label>
                  {name} ({count})
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Fabrics List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFabrics.map((fabric) => (
          <motion.div
            key={fabric.id}
            onClick={() => setSelectedFabric(fabric)} // NEW
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
                  ₹{fabric.price}
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
                        Price (₹)
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
      <FabricDetailSlider
        fabric={selectedFabric}
        onClose={() => setSelectedFabric(null)}
        onUpdated={fetchFabrics}
      />
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
                ₹
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

function FabricDetailSlider({ fabric, onClose, onUpdated }) {
  const [available, setAvailable] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (fabric) {
      setAvailable(parseFloat(fabric.availableMeters) || 0);
    }
  }, [fabric]);

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
      toast.success("Fabric Updated Successfully!");
      onUpdated();

      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const docRef = doc(db, "fabrics", fabric.id);
      await deleteDoc(docRef);
      onUpdated();
      setShowDeleteConfirm(false);
      toast.success("Fabric Deleted Successfully!");
      onClose();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete fabric. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        // Close when clicking the overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="bg-white w-full md:w-96 h-full shadow-lg flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <Tag size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{fabric.name}</h2>
              <p className="text-xs text-gray-500">ID: {fabric.fabricId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-3 font-medium text-sm flex justify-center items-center ${
              activeTab === "details"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("details")}
          >
            <Info size={16} className="mr-2" />
            Details
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm flex justify-center items-center ${
              activeTab === "history"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History size={16} className="mr-2" />
            History
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {/* Image */}
                <div className="h-56 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 mb-4">
                  {fabric.image ? (
                    <img
                      src={fabric.image}
                      alt={fabric.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Image size={40} className="mb-2 opacity-30" />
                      <span className="text-sm">No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                  {/* Price Card */}
                  <div className="bg-indigo-50 p-3 rounded-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">₹</div>
                      <div>
                        <p className="text-xs text-indigo-600 font-medium">
                          Price
                        </p>
                        <p className="text-lg font-bold text-indigo-700">
                          ₹{formatPrice(fabric.price)}
                        </p>
                      </div>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-indigo-600 shadow-sm">
                      {fabric.currency || "INR"}
                    </span>
                  </div>

                  {/* Store & Date Card */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <ShoppingBag size={14} className="text-gray-500 mr-1" />
                        <p className="text-xs text-gray-500">Purchased From</p>
                      </div>
                      <p className="font-medium text-gray-800 truncate">
                        {fabric.purchasedFrom || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Calendar size={14} className="text-gray-500 mr-1" />
                        <p className="text-xs text-gray-500">Purchased On</p>
                      </div>
                      <p className="font-medium text-gray-800 truncate">
                        {formatDate(fabric.purchasedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <StickyNote size={14} className="text-gray-500 mr-1" />
                      <p className="text-xs text-gray-500">Notes</p>
                    </div>
                    <p className="text-gray-800 text-sm">
                      {fabric.notes || "No notes available."}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <div className="space-y-3">
                  {fabric.logs?.length > 0 ? (
                    fabric.logs
                      .slice()
                      .reverse()
                      .map((log, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div
                              className={`text-sm font-medium ${
                                log.change > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {log.change > 0 ? "+" : ""}
                              {log.change} meters
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.date).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center">
                            <span className="mr-1">New Total:</span>
                            <span className="font-medium">
                              {log.updatedTo} meters
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <History size={24} className="mx-auto mb-2 opacity-30" />
                      <p>No update history available.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action Section */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Meters
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setAvailable((prev) => Math.max(0, prev - 0.5))}
                className="h-10 w-10 bg-gray-100 hover:bg-gray-200 rounded-l-lg flex items-center justify-center border border-gray-200 transition-colors"
                aria-label="Decrease"
              >
                <Minus size={16} className="text-gray-700" />
              </button>
              <input
                type="number"
                value={available}
                onChange={(e) => setAvailable(parseFloat(e.target.value) || 0)}
                className="h-10 w-16 text-center border-t border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                step="0.1"
                min="0"
              />
              <button
                onClick={() => setAvailable((prev) => prev + 0.5)}
                className="h-10 w-10 bg-gray-100 hover:bg-gray-200 rounded-r-lg flex items-center justify-center border border-gray-200 transition-colors"
                aria-label="Increase"
              >
                <Plus size={16} className="text-gray-700" />
              </button>
              <div className="ml-2 flex-1">
                <div className="text-xs text-gray-500 mb-1">Current</div>
                <div className="flex items-baseline">
                  <span className="text-base font-medium">
                    {parseFloat(fabric.availableMeters || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">meters</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={
              saving || available === parseFloat(fabric.availableMeters)
            }
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center font-medium text-white ${
              saving || available === parseFloat(fabric.availableMeters)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {available === parseFloat(fabric.availableMeters)
                  ? "No Changes"
                  : "Update Fabric"}
              </>
            )}
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-2 w-full flex items-center mb-5 justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
              Delete Fabric
            </button>
          ) : (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm mb-2">
                Are you sure you want to delete this fabric? This action cannot
                be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-1 rounded"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-1 rounded flex items-center justify-center gap-1"
                  disabled={deleting}
                >
                  {deleting ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
