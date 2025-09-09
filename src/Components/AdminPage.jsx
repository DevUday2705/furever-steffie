import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // make sure path is correct
import { motion } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import OrderFilters from "./OrderFilters"; // Import the new component

const ADMIN_KEY = "What@123";

const AdminPage = () => {
  const [passkey, setPasskey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({}); // Store product data for dhoti lookup

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => {
    // Default to current month start
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split("T")[0];
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Measurements editing states
  const [editingMeasurements, setEditingMeasurements] = useState(null); // {orderId, itemIndex}
  const [measurementValues, setMeasurementValues] = useState({
    neck: "",
    chest: "",
    back: ""
  });

  // Helper function to get dhoti details from product data
  const getDhotiDetails = (item) => {
    if (item.selectedDhotiDetails) {
      return item.selectedDhotiDetails;
    }

    if (item.selectedDhoti && item.category) {
      const productKey = `${item.category}s`; // e.g., "kurtas"
      const product = productData[productKey]?.find(
        (p) => p.id === item.productId
      );
      if (product?.dhotis) {
        return product.dhotis.find(
          (dhoti) => dhoti.name === item.selectedDhoti
        );
      }
    }

    return null;
  };

  // Helper function to get readable style name
  const getStyleDisplayName = (selectedStyle) => {
    const styleMap = {
      simple: "Simple",
      tassels: "With Tassels",
      beaded: "Beaded Luxe",
      "beaded-tassels": "Beaded + Tassels",
    };
    return styleMap[selectedStyle] || selectedStyle;
  };

  const handleLogin = () => {
    if (passkey === ADMIN_KEY) {
      setIsAuthorized(true);
    } else {
      alert("Wrong admin key!");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOrders();
      fetchProductData(); // Fetch product data for dhoti lookup
    }
  }, [isAuthorized]);

  const fetchOrders = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "orders"));
    const allOrders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setOrders(allOrders);
    setLoading(false);
  };

  const fetchProductData = async () => {
    try {
      // Fetch kurtas data for dhoti lookup
      const kurtasSnapshot = await getDocs(collection(db, "kurtas"));
      const kurtasData = kurtasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProductData((prev) => ({
        ...prev,
        kurtas: kurtasData,
      }));
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === "shipped") {
        const trackingID = prompt(
          "Enter tracking ID before marking as shipped:"
        );
        if (!trackingID) {
          toast.error("Tracking ID is required to mark as shipped.");
          return;
        }

        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          orderStatus: "shipped",
          tracking_id: trackingID,
        });

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: "shipped", tracking_id: trackingID }
              : order
          )
        );
        toast.success("Tracking ID saved & status updated");
        fetchOrders();
      } else {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          orderStatus: newStatus,
        });

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
        toast.success("Status updated");
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Try again.");
    }
  };

  // Handle measurements editing
  const startEditingMeasurements = (orderId, itemIndex, currentMeasurements) => {
    setEditingMeasurements({ orderId, itemIndex });
    setMeasurementValues({
      neck: currentMeasurements?.neck || "",
      chest: currentMeasurements?.chest || "",
      back: currentMeasurements?.back || ""
    });
  };

  const cancelEditingMeasurements = () => {
    setEditingMeasurements(null);
    setMeasurementValues({ neck: "", chest: "", back: "" });
  };

  const saveMeasurements = async () => {
    if (!editingMeasurements) return;

    const { orderId, itemIndex } = editingMeasurements;

    try {
      // Find the order and update the measurements for the specific item
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate) {
        toast.error("Order not found");
        return;
      }

      // Create updated items array
      const updatedItems = [...orderToUpdate.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        measurements: {
          neck: measurementValues.neck,
          chest: measurementValues.chest,
          back: measurementValues.back
        }
      };

      // Update in Firebase
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        items: updatedItems
      });

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, items: updatedItems }
            : order
        )
      );

      toast.success("Measurements updated successfully!");
      cancelEditingMeasurements();
      
    } catch (err) {
      console.error("Error updating measurements:", err);
      toast.error("Failed to update measurements. Please try again.");
    }
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurementValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };
  console.log(orders);
  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter((order) => {
      // Search filter
      const nameMatch = order.customer?.fullName
        ?.toLowerCase()
        ?.includes(searchQuery);
      const phoneMatch = order.customer?.mobileNumber
        ?.toLowerCase()
        ?.includes(searchQuery);
      const matchesSearch = nameMatch || phoneMatch;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      // Date filter
      const orderDate = new Date(order.createdAt);
      // Check date range
      let matchesDate = true;
      if (startDate && endDate) {
        // Create start and end date objects for comparison
        const startDateObj = new Date(startDate + "T00:00:00");
        const endDateObj = new Date(endDate + "T23:59:59");

        matchesDate = orderDate >= startDateObj && orderDate <= endDateObj;
      }

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      // Sort by date or amount
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "amount-high") {
        return b.amount - a.amount;
      } else if (sortBy === "amount-low") {
        return a.amount - b.amount;
      }
      return 0;
    });

  // Dashboard statistics
  const orderStats = {
    total: filteredAndSortedOrders.length,
    pending: filteredAndSortedOrders.filter((o) => o.orderStatus === "pending")
      .length,
    workInProgress: filteredAndSortedOrders.filter(
      (o) => o.orderStatus === "work-in-progress"
    ).length,
    readyToShip: filteredAndSortedOrders.filter(
      (o) => o.orderStatus === "ready-to-ship"
    ).length,
    shipped: filteredAndSortedOrders.filter((o) => o.orderStatus === "shipped")
      .length,
    totalAmount: filteredAndSortedOrders.reduce(
      (sum, order) => sum + (Number(order.amount) || 0),
      0
    ),
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Admin Access</h2>
        <input
          type="password"
          placeholder="Enter admin passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm w-full max-w-xs"
        />
        <button
          onClick={handleLogin}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-full max-w-xs"
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-xl font-bold mb-4">📦 Orders Management</h1>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-bold text-gray-600">
            {orderStats.pending}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-lg font-bold text-yellow-500">
            {orderStats.workInProgress}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Ready </p>
          <p className="text-lg font-bold text-indigo-500">
            {orderStats.readyToShip}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-lg font-bold text-green-600">
            ₹{orderStats.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <OrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Revenue Summary */}
      {filteredAndSortedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredAndSortedOrders.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹
                {filteredAndSortedOrders
                  .reduce((sum, order) => sum + (order.amount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹
                {Math.round(
                  filteredAndSortedOrders.reduce(
                    (sum, order) => sum + (order.amount || 0),
                    0
                  ) / filteredAndSortedOrders.length
                ).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 text-center text-sm text-gray-600">
            Date Range: {new Date(startDate).toLocaleDateString()} to{" "}
            {new Date(endDate).toLocaleDateString()}
          </div>
        </div>
      )}

      {
        <span className="my-2 text-gray-500 inline-block italic">
          {orders.length} total orders • {filteredAndSortedOrders.length}{" "}
          filtered orders
        </span>
      }
      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : filteredAndSortedOrders.length === 0 ? (
        <p className="text-center text-gray-500">
          No orders match your filters.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <button
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.id ? null : order.id
                      )
                    }
                    className="text-lg font-bold text-indigo-600 underline mb-1"
                  >
                    {order.customer?.fullName}
                  </button>
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    📞 {order.customer?.mobileNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    📅{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ₹{order.amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items?.length} item(s)
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs">
                <label className="text-gray-500 font-semibold">
                  {" "}
                  Payment Status:{" "}
                </label>
                {order.paymentStatus}
                <div className="mt-3 text-xs">
                  <label className="text-gray-500"> Order Status: </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-[10px] font-semibold
                      ${
                        order.orderStatus === "pending"
                          ? "bg-gray-400"
                          : order.orderStatus === "work-in-progress"
                          ? "bg-yellow-500"
                          : order.orderStatus === "ready-to-ship"
                          ? "bg-indigo-500"
                          : order.orderStatus === "shipped"
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }
                    `}
                    >
                      {order.orderStatus}
                    </span>

                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="text-xs bg-white border border-gray-300 px-2 py-1 rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="work-in-progress">Work in Progress</option>
                      <option value="ready-to-ship">Ready to Ship</option>
                      <option value="shipped">shipped</option>
                    </select>
                  </div>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="mt-4 border-t pt-3 text-xs text-gray-700 space-y-2">
                  <div>
                    <p className="font-semibold mt-2">Items Ordered</p>
                    <div className="space-y-1">
                      {order.items?.map((item, idx) => {
                        // Debug: Log item data to see what's being stored
                        console.log("Order item data:", {
                          name: item.name,
                          selectedDhoti: item.selectedDhoti,
                          selectedDhotiDetails: item.selectedDhotiDetails,
                          hasImage: !!item.selectedDhotiDetails?.image,
                        });

                        // Get dhoti details using helper function
                        const dhotiBrother = getDhotiDetails(item);

                        return (
                          <div
                            key={idx}
                            className="border p-3 rounded bg-gray-50"
                          >
                            <div className="flex gap-3">
                              {/* Main Product Image */}
                              {item.image && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded border"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}

                              {/* Dhoti Image if selected */}
                              {dhotiBrother && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={dhotiBrother.image}
                                    alt={`${dhotiBrother.name} dhoti`}
                                    className="w-20 h-20 object-cover rounded border border-blue-200"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                  <p className="text-xs text-center text-blue-600 mt-1">
                                    {dhotiBrother.name} Dhoti
                                  </p>
                                </div>
                              )}

                              {/* Product Details */}
                              <div className="flex-1">
                                <p className="font-medium text-base">
                                  {item.name}
                                </p>
                                <p className="text-sm">
                                  Size:{" "}
                                  <span className="font-medium">
                                    {item.selectedSize}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  Price:{" "}
                                  <span className="font-medium text-green-600">
                                    ₹{item.price}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  Full Royal Set:{" "}
                                  <span className="font-medium">
                                    {item.isRoyalSet ? "Yes" : "No"}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  Beaded:{" "}
                                  <span className="font-medium">
                                    {item.isBeaded ? "Yes" : "No"}
                                  </span>
                                  , Full Set:{" "}
                                  <span className="font-medium">
                                    {item.isFullSet ? "Yes" : "No"}
                                  </span>
                                  {item.isDupattaSet && (
                                    <>
                                      , Dupatta Set:{" "}
                                      <span className="font-medium text-purple-600">
                                        Yes
                                      </span>
                                    </>
                                  )}
                                  {item.selectedStyle && (
                                    <>
                                      , Style:{" "}
                                      <span className="font-medium text-orange-600">
                                        {getStyleDisplayName(
                                          item.selectedStyle
                                        )}
                                      </span>
                                    </>
                                  )}
                                </p>
                                {(item.selectedDhoti || dhotiBrother) && (
                                  <p className="text-sm">
                                    Dhoti:{" "}
                                    <span className="font-medium text-blue-600">
                                      {dhotiBrother?.name || item.selectedDhoti}
                                    </span>
                                    {item.selectedDhoti && !dhotiBrother && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        (lookup failed - product data not
                                        loaded)
                                      </span>
                                    )}
                                  </p>
                                )}
                                {item.selectedColor && (
                                  <p className="text-sm">
                                    Color:{" "}
                                    <span className="font-medium">
                                      {item.selectedColor}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Measurements Section */}
                            <div className="text-xs text-gray-600 mt-2 p-3 bg-blue-50 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">📏 Measurements</p>
                                {editingMeasurements?.orderId === order.id && editingMeasurements?.itemIndex === idx ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={saveMeasurements}
                                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEditingMeasurements}
                                      className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditingMeasurements(order.id, idx, item.measurements)}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                  >
                                    {item.measurements?.neck || item.measurements?.chest || item.measurements?.back ? 'Edit' : 'Add'}
                                  </button>
                                )}
                              </div>

                              {editingMeasurements?.orderId === order.id && editingMeasurements?.itemIndex === idx ? (
                                // Editing Mode
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Neck (inches)</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={measurementValues.neck}
                                        onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Chest (inches)</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={measurementValues.chest}
                                        onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Back (inches)</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={measurementValues.back}
                                        onChange={(e) => handleMeasurementChange('back', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.0"
                                      />
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    💡 Enter measurements in inches as provided by customer
                                  </p>
                                </div>
                              ) : (
                                // Display Mode
                                <div>
                                  {item.measurements?.neck || item.measurements?.chest || item.measurements?.back ? (
                                    <div className="text-sm">
                                      <span className="font-medium">Neck:</span> {item.measurements.neck || 'N/A'}&quot;  •  
                                      <span className="font-medium">Chest:</span> {item.measurements.chest || 'N/A'}&quot;  •  
                                      <span className="font-medium">Back:</span> {item.measurements.back || 'N/A'}&quot;
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 italic">
                                      No measurements added yet. Click &quot;Add&quot; to enter customer measurements.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold">Customer Details</p>
                    <p>
                      {" "}
                      <span className="font-bold">Name:</span>{" "}
                      {order.customer?.fullName}
                    </p>
                    <p>
                      <span className="font-bold">Phone:</span>{" "}
                      {order.customer?.mobileNumber}
                    </p>
                    <p>
                      <span className="font-bold">WhatsApp Number :</span>{" "}
                      {order.customer?.alternateMobile || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold">Address:</span>{" "}
                      {order.customer?.addressLine1},{" "}
                      {order.customer?.addressLine2}, {order.customer?.city},{" "}
                      {order.customer?.state} - {order.customer?.pincode}
                    </p>
                    <p>
                      <span className="font-bold">Instructions:</span>{" "}
                      {order.customer?.specialInstructions}
                    </p>
                    <p>
                      <span className="font-bold">Delivery:</span>{" "}
                      {order.customer?.deliveryOption}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="font-semibold">Razorpay</p>
                    <p>Order ID: {order.razorpay_order_id}</p>

                    <p>Payment ID: {order.razorpay_payment_id}</p>
                    {order.tracking_id && (
                      <p>
                        <span className="font-semibold">Tracking ID:</span>{" "}
                        {order.tracking_id}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
