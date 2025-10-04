import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
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
  const [expandedReminderId, setExpandedReminderId] = useState(null); // New state for reminder history
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({}); // Store product data for dhoti lookup

  // Close reminder dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedReminderId && !event.target.closest('.reminder-dropdown')) {
        setExpandedReminderId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedReminderId]);

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
  const [measurementFilter, setMeasurementFilter] = useState("all");

  // Measurements editing states
  const [editingMeasurements, setEditingMeasurements] = useState(null); // {orderId, itemIndex}
  const [measurementValues, setMeasurementValues] = useState({
    neck: "",
    chest: "",
    back: "",
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

  // Helper function to format reminder timestamp
  const formatReminderTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Helper function to check if an order has measurements
  const orderHasMeasurements = (order) => {
    if (!order.items || order.items.length === 0) return false;

    return order.items.some((item) => {
      const measurements = item.measurements;
      if (!measurements) return false;

      // Check if any of the measurement fields have values
      return (
        measurements.neck?.trim() ||
        measurements.chest?.trim() ||
        measurements.back?.trim()
      );
    });
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
      // Find the order to get customer details
      const currentOrder = orders.find((order) => order.id === orderId);
      if (!currentOrder) {
        toast.error("Order not found");
        return;
      }

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

        // Send shipped WhatsApp notification
        try {
          // Calculate expected delivery (3 working days from today)
          const today = new Date();
          const expectedDelivery = new Date(today);
          expectedDelivery.setDate(today.getDate() + 5); // 3 working days + 2 for weekends
          const formattedDeliveryDate = expectedDelivery.toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          );

          await fetch("/api/send-shipped-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: currentOrder.customer?.fullName,
              razorpayOrderId:
                currentOrder.razorpay_order_id || currentOrder.orderNumber,
              trackingId: trackingID,
              expectedDelivery: formattedDeliveryDate,
              customerCity: currentOrder.customer?.city,
              mobileNumber: currentOrder.customer?.mobileNumber,
            }),
          });
          console.log("📱 Shipped notification sent");
        } catch (whatsappError) {
          console.error("❌ Shipped notification failed:", whatsappError);
          // Don't fail the status update if WhatsApp fails
        }

        toast.success("Tracking ID saved & status updated");
        fetchOrders();
      } else if (newStatus === "work-in-progress") {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          orderStatus: newStatus,
        });

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );

        // Send in-progress WhatsApp notification
        try {
          // Get dispatch date from order
          const dispatchDate = currentOrder.dispatchDate
            ? new Date(currentOrder.dispatchDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "TBD";

          // Get measurements from the first item (assuming all items have similar measurements)
          const firstItem = currentOrder.items?.[0];
          const measurements = firstItem?.measurements || {};

          await fetch("/api/send-inprogress-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: currentOrder.customer?.fullName,
              orderId:
                currentOrder.razorpay_order_id || currentOrder.orderNumber,
              dispatchDate: dispatchDate,
              neckMeasurement: measurements.neck,
              chestMeasurement: measurements.chest,
              backMeasurement: measurements.back,
              mobileNumber: currentOrder.customer?.mobileNumber,
            }),
          });
          console.log("📱 In-progress notification sent");
        } catch (whatsappError) {
          console.error("❌ In-progress notification failed:", whatsappError);
          // Don't fail the status update if WhatsApp fails
        }

        toast.success("Status updated");
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
  const startEditingMeasurements = (
    orderId,
    itemIndex,
    currentMeasurements
  ) => {
    setEditingMeasurements({ orderId, itemIndex });
    setMeasurementValues({
      neck: currentMeasurements?.neck || "",
      chest: currentMeasurements?.chest || "",
      back: currentMeasurements?.back || "",
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
      const orderToUpdate = orders.find((order) => order.id === orderId);
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
          back: measurementValues.back,
        },
      };

      // Update in Firebase
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        items: updatedItems,
      });

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, items: updatedItems } : order
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
    setMeasurementValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Delete order function
  const handleDeleteOrder = async (orderId, customerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the order for ${customerName}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      // Delete from Firebase
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);

      // Update local state
      setOrders((prev) => prev.filter((order) => order.id !== orderId));

      toast.success("Order deleted successfully!");

      // If the deleted order was expanded, close it
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Failed to delete order. Please try again.");
    }
  };

  // Send measurement reminder function
  const handleSendMeasurementReminder = async (order) => {
    const customerName = order.customer?.fullName || "Customer";
    const customerEmail = order.customer?.email || "";

    // Show confirmation before sending
    const confirmSend = window.confirm(
      `Send measurement reminder to ${customerName} (${customerEmail})?`
    );

    if (!confirmSend) return;

    try {
      // Show loading state
      toast.loading(`Sending reminder to ${customerName}...`);

      // Call the measurement reminder API
      const response = await fetch("/api/send-measurement-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber || order.id,
          customer: order.customer,
          items: order.items,
        }),
      });

      if (response.ok) {
        // Update the order with reminder history
        const orderRef = doc(db, "orders", order.id);
        const currentTime = new Date().toISOString();

        // Add reminder to history array
        const existingHistory = order.reminderHistory || [];
        const newReminder = {
          sentAt: currentTime,
          sentBy: "admin", // You can update this with actual admin user info
          type: "measurement_reminder",
          status: "sent",
        };

        await updateDoc(orderRef, {
          reminderHistory: [...existingHistory, newReminder],
          lastReminderSent: currentTime,
        });

        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  reminderHistory: [...existingHistory, newReminder],
                  lastReminderSent: currentTime,
                }
              : o
          )
        );

        toast.dismiss();
        toast.success(`Measurement reminder sent to ${customerName}`);
      } else {
        throw new Error("Failed to send reminder");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to send reminder to ${customerName}`);
      console.error("Error sending measurement reminder:", error);
    }
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

      // Measurement filter
      let matchesMeasurements = true;
      if (measurementFilter === "has-measurements") {
        matchesMeasurements = orderHasMeasurements(order);
      } else if (measurementFilter === "no-measurements") {
        // Only show non-shipped orders that don't have measurements
        matchesMeasurements =
          !orderHasMeasurements(order) && order.orderStatus !== "shipped";
      }

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

      return (
        matchesSearch && matchesStatus && matchesMeasurements && matchesDate
      );
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
      } else if (sortBy === "dispatch-earliest") {
        // Sort by dispatch date - earliest first
        const dateA = a.dispatchDate
          ? new Date(a.dispatchDate)
          : new Date("9999-12-31");
        const dateB = b.dispatchDate
          ? new Date(b.dispatchDate)
          : new Date("9999-12-31");
        return dateA - dateB;
      } else if (sortBy === "dispatch-latest") {
        // Sort by dispatch date - latest first
        const dateA = a.dispatchDate
          ? new Date(a.dispatchDate)
          : new Date("1900-01-01");
        const dateB = b.dispatchDate
          ? new Date(b.dispatchDate)
          : new Date("1900-01-01");
        return dateB - dateA;
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
        measurementFilter={measurementFilter}
        setMeasurementFilter={setMeasurementFilter}
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
                  {/* Dispatch Date - Prominent Display */}
                  <div className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md mt-1 inline-block">
                    🚚 Dispatch:{" "}
                    {order.dispatchDate
                      ? new Date(order.dispatchDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Not set"}
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

                    {/* Measurement reminder button for orders without measurements */}
                    {!orderHasMeasurements(order) && (
                      <button
                        onClick={() => handleSendMeasurementReminder(order)}
                        className="ml-2 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs rounded transition-colors duration-200 flex items-center gap-1"
                        title="Send Measurement Reminder"
                      >
                        ⚠️ Remind
                      </button>
                    )}

                    {/* Reminder History Display */}
                    {order.reminderHistory &&
                      order.reminderHistory.length > 0 && (
                        <div className="ml-2 relative reminder-dropdown">
                          <button 
                            onClick={() => setExpandedReminderId(expandedReminderId === order.id ? null : order.id)}
                            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded transition-colors duration-200 flex items-center gap-1"
                          >
                            📧 {order.reminderHistory.length}
                            <span className="text-[10px]">
                              {expandedReminderId === order.id ? '▼' : '▶'}
                            </span>
                          </button>

                          {/* Collapsible reminder history */}
                          {expandedReminderId === order.id && (
                            <div className="absolute top-full left-0 mt-1 z-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-semibold text-gray-800">Reminder History</h4>
                                <button 
                                  onClick={() => setExpandedReminderId(null)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {order.reminderHistory.slice().reverse().map((reminder, index) => (
                                  <div key={index} className="bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-gray-700 font-medium">Measurement reminder</span>
                                      </div>
                                      <span className="text-xs text-gray-500">{formatReminderTime(reminder.sentAt)}</span>
                                    </div>
                                    <div className="mt-1 ml-4">
                                      <p className="text-xs text-gray-500">
                                        {new Date(reminder.sentAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {order.lastReminderSent && (
                                <div className="mt-3 pt-2 border-t border-gray-100 bg-blue-50 rounded p-2">
                                  <p className="text-xs text-blue-700 font-medium">
                                    Last reminder: {formatReminderTime(order.lastReminderSent)}
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    {new Date(order.lastReminderSent).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    <button
                      onClick={() =>
                        handleDeleteOrder(order.id, order.customer?.fullName)
                      }
                      className="ml-2 px-2 py-1 bg-white hover:bg-red-600 hover:text-white text-black text-xs rounded transition-colors duration-200"
                      title="Delete Order"
                    >
                      🗑️ Delete
                    </button>
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
                            className={` p-4 rounded-lg ${
                              item.isRoyalSet
                                ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-md"
                                : "bg-gray-50"
                            }`}
                          >
                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Left Column: Images Grid (2 images per row) */}
                              <div className="lg:col-span-1">
                                <div className="grid grid-cols-2 gap-2">
                                  {/* Main Product Image */}
                                  {item.image && (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                      <p className="text-xs text-center text-gray-600 mt-1 font-medium">
                                        Main
                                      </p>
                                    </div>
                                  )}

                                  {/* Dhoti Image if selected */}
                                  {dhotiBrother && (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src={dhotiBrother.image}
                                        alt={`${dhotiBrother.name} dhoti`}
                                        className="w-16 h-16 object-cover rounded-lg border-2 border-blue-300 shadow-sm"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                      <p className="text-xs text-center text-blue-600 mt-1 font-medium">
                                        Dhoti
                                      </p>
                                    </div>
                                  )}

                                  {/* Dupatta Image if isDupattaSet or isRoyalSet */}
                                  {(item.isDupattaSet || item.isRoyalSet) && (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src="https://res.cloudinary.com/di6unrpjw/image/upload/v1758442036/Dupatta-Photoroom_fstzde.png"
                                        alt="Dupatta"
                                        className="w-16 h-16 object-cover rounded-lg border-2 border-purple-300 shadow-sm"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                      <p className="text-xs text-center text-purple-600 mt-1 font-medium">
                                        Dupatta
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Column: Product Details */}
                              <div className="lg:col-span-2">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4
                                      className={`font-semibold text-lg ${
                                        item.isRoyalSet
                                          ? "text-yellow-700"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {item.name}
                                    </h4>
                                    {item.isRoyalSet && (
                                      <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-yellow-800 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full border border-yellow-400 shadow-sm">
                                        👑 ROYAL
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-600">
                                        Size:
                                      </span>
                                      <span className="font-medium ml-1">
                                        {item.selectedSize}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Price:
                                      </span>
                                      <span className="font-semibold text-green-600 ml-1">
                                        ₹{item.price}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Full Royal Set:
                                      </span>
                                      <span className="font-medium ml-1">
                                        {item.isRoyalSet ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Beaded:
                                      </span>
                                      <span className="font-medium ml-1">
                                        {item.isBeaded ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Full Set:
                                      </span>
                                      <span className="font-medium ml-1">
                                        {item.isFullSet ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    {item.isDupattaSet && (
                                      <div>
                                        <span className="text-gray-600">
                                          Dupatta Set:
                                        </span>
                                        <span className="font-medium text-purple-600 ml-1">
                                          Yes
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Additional Details Row */}
                                  <div className="space-y-1 text-sm">
                                    {item.selectedStyle && (
                                      <div>
                                        <span className="text-gray-600">
                                          Style:
                                        </span>
                                        <span className="font-medium text-orange-600 ml-1">
                                          {getStyleDisplayName(
                                            item.selectedStyle
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {(item.selectedDhoti || dhotiBrother) && (
                                      <div>
                                        <span className="text-gray-600">
                                          Dhoti:
                                        </span>
                                        <span className="font-medium text-blue-600 ml-1">
                                          {dhotiBrother?.name ||
                                            item.selectedDhoti}
                                        </span>
                                        {item.selectedDhoti &&
                                          !dhotiBrother && (
                                            <span className="text-xs text-gray-500 ml-2">
                                              (lookup failed)
                                            </span>
                                          )}
                                      </div>
                                    )}
                                    {item.selectedColor && (
                                      <div>
                                        <span className="text-gray-600">
                                          Color:
                                        </span>
                                        <span className="font-medium ml-1">
                                          {item.selectedColor}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Measurements Section */}
                            <div className="text-xs text-gray-600 mt-2 p-3 bg-blue-50 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">
                                  📏 Measurements
                                </p>
                                {editingMeasurements?.orderId === order.id &&
                                editingMeasurements?.itemIndex === idx ? (
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
                                    onClick={() =>
                                      startEditingMeasurements(
                                        order.id,
                                        idx,
                                        item.measurements
                                      )
                                    }
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                  >
                                    {item.measurements?.neck ||
                                    item.measurements?.chest ||
                                    item.measurements?.back
                                      ? "Edit"
                                      : "Add"}
                                  </button>
                                )}
                              </div>

                              {editingMeasurements?.orderId === order.id &&
                              editingMeasurements?.itemIndex === idx ? (
                                // Editing Mode
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Neck (inches)
                                      </label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={measurementValues.neck}
                                        onChange={(e) =>
                                          handleMeasurementChange(
                                            "neck",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Chest (inches)
                                      </label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={measurementValues.chest}
                                        onChange={(e) =>
                                          handleMeasurementChange(
                                            "chest",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Back (inches)
                                      </label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={measurementValues.back}
                                        onChange={(e) =>
                                          handleMeasurementChange(
                                            "back",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.0"
                                      />
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    💡 Enter measurements in inches as provided
                                    by customer
                                  </p>
                                </div>
                              ) : (
                                // Display Mode
                                <div>
                                  {item.measurements?.neck ||
                                  item.measurements?.chest ||
                                  item.measurements?.back ? (
                                    <div className="text-sm">
                                      <span className="font-medium">Neck:</span>{" "}
                                      {item.measurements.neck || "N/A"}&quot; •
                                      <span className="font-medium">
                                        Chest:
                                      </span>{" "}
                                      {item.measurements.chest || "N/A"}&quot; •
                                      <span className="font-medium">Back:</span>{" "}
                                      {item.measurements.back || "N/A"}&quot;
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 italic">
                                      No measurements added yet. Click
                                      &quot;Add&quot; to enter customer
                                      measurements.
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
