import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // make sure path is correct
import { motion } from "framer-motion";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import OrderFilters from "./OrderFilters"; // Import the new component
import OrderResumeNotifications from "./OrderResumeNotifications";
import CouponManager from "./CouponManager";
import { useOrderPause } from "../context/OrderPauseContext";

const ADMIN_KEY = "What@123";

const AdminPage = () => {
  const [passkey, setPasskey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({}); // Store product data for dhoti lookup
  const { ordersArePaused, setOrdersArePaused } = useOrderPause();

  // Tab state for admin navigation
  const [activeTab, setActiveTab] = useState("orders");

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
  const [collaborationFilter, setCollaborationFilter] = useState("all");

  // Measurements editing states
  const [editingMeasurements, setEditingMeasurements] = useState(null); // {orderId, itemIndex}
  const [measurementValues, setMeasurementValues] = useState({
    neck: "",
    chest: "",
    back: "",
  });

  // Reminder functionality states
  const [sendingReminder, setSendingReminder] = useState(new Set());

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

        // Send shipped notification email to customer
        try {
          const order = orders.find((o) => o.id === orderId) || {};

          const resp = await fetch("/api/send-shipped-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerName: order.customer?.fullName || "",
              customerEmail: order.customer?.email || order.customer?.mobileNumber || "",
              orderId: orderId,
              trackingId: trackingID,
              expectedDelivery: order.dispatchDate || "",
              customerCity: order.customer?.city || "",
              courierPartner: order.courierPartner || "",
              items: order.items || [],
            }),
          });

          if (resp.ok) {
            toast.success("Shipment email sent to customer");
          } else {
            const err = await resp.json().catch(() => null);
            console.error("Failed to send shipped email:", err);
            toast.error("Failed to send shipped email to customer");
          }
        } catch (emailErr) {
          console.error("Error sending shipped email:", emailErr);
          toast.error("Error sending shipped email");
        }

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

  const handleDeleteOrder = async (orderId, customerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the order for ${customerName}? This action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast.success("Order deleted successfully");
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Failed to delete order. Please try again.");
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

  // Send measurement reminder function
  const sendMeasurementReminder = async (orderId) => {
    setSendingReminder((prev) => new Set(prev).add(orderId));

    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      const response = await fetch("/api/send-measurement-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.id,
          customer: order.customer,
          items: order.items,
        }),
      });

      if (response.ok) {
        // Update the order with reminder info
        const currentTime = new Date().toISOString();
        const orderRef = doc(db, "orders", orderId);
        const reminderCount = (order.reminderCount || 0) + 1;

        await updateDoc(orderRef, {
          lastReminderSent: currentTime,
          reminderCount: reminderCount,
        });

        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, lastReminderSent: currentTime, reminderCount }
              : o
          )
        );

        toast.success(
          `Measurement reminder sent successfully! (Reminder #${reminderCount})`
        );
      } else {
        throw new Error("Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send measurement reminder. Please try again.");
    } finally {
      setSendingReminder((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Pin/Unpin functionality
  const handlePinToggle = async (orderId) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      const newPinnedState = !order?.pinned;

      // Update Firebase
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        pinned: newPinnedState,
      });

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, pinned: newPinnedState } : order
        )
      );

      toast.success(
        newPinnedState ? "Order pinned to top!" : "Order unpinned!"
      );
    } catch (error) {
      console.error("Error updating pin status:", error);
      toast.error("Failed to update pin status");
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

      // Measurement filter
      let matchesMeasurement = true;
      if (measurementFilter !== "all") {
        const hasMeasurements = order.items?.some(
          (item) =>
            item.measurements?.neck ||
            item.measurements?.chest ||
            item.measurements?.back
        );

        if (measurementFilter === "has-measurements") {
          matchesMeasurement = hasMeasurements;
        } else if (measurementFilter === "no-measurements") {
          matchesMeasurement = !hasMeasurements;
        }
      }

      // Collaboration filter
      let matchesCollaboration = true;
      if (collaborationFilter !== "all") {
        if (collaborationFilter === "collaboration") {
          matchesCollaboration = order.isCollaboration === true;
        } else if (collaborationFilter === "regular") {
          matchesCollaboration = order.isCollaboration !== true;
        }
      }

      return (
        matchesSearch && matchesStatus && matchesDate && matchesMeasurement && matchesCollaboration
      );
    })
    .sort((a, b) => {
      // First priority: Pinned orders always come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Second priority: Sort by selected criteria within pinned/unpinned groups
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
    pinned: filteredAndSortedOrders.filter((o) => o.pinned).length,
    collaboration: filteredAndSortedOrders.filter((o) => o.isCollaboration === true).length,
    pending: filteredAndSortedOrders.filter((o) => o.orderStatus === "pending")
      .length,
    workInProgress: filteredAndSortedOrders.filter(
      (o) => o.orderStatus === "work-in-progress"
    ).length,
    cutting: filteredAndSortedOrders.filter((o) => o.orderStatus === "cutting")
      .length,
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
      <h1 className="text-xl font-bold mb-4">📦 Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📦 Orders Management
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            🔔 Resume Notifications
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "coupons"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            🎫 Custom Coupons
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500">📌 Pinned</p>
              <p className="text-lg font-bold text-amber-600">
                {orderStats.pinned}
              </p>
            </div>
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
              <p className="text-xs text-gray-500">Cutting</p>
              <p className="text-lg font-bold text-orange-500">
                {orderStats.cutting}
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

          {/* Order Pause Control */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-800">
                  Order Management
                </h3>
                <p className="text-sm text-amber-700">
                  {ordersArePaused
                    ? "Orders are currently paused. Customers will see a notification and can sign up for alerts."
                    : "Orders are active and customers can place new orders normally."}
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const newStatus = !ordersArePaused;
                    await setOrdersArePaused(newStatus);
                    toast.success(
                      newStatus
                        ? "Orders paused - customers will see notification modal"
                        : "Orders resumed - customers can place orders normally"
                    );
                  } catch (error) {
                    console.error("Error updating order pause status:", error);
                    toast.error(
                      "Failed to update order status. Please try again."
                    );
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  ordersArePaused
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {ordersArePaused ? "Resume Orders" : "Pause Orders"}
              </button>
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
            collaborationFilter={collaborationFilter}
            setCollaborationFilter={setCollaborationFilter}
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
            <div className="my-2 flex items-center justify-between">
              <span className="text-gray-500 italic">
                {orders.length} total orders • {filteredAndSortedOrders.length}{" "}
                filtered orders
                {orderStats.pinned > 0 && (
                  <>
                    {" "}
                    •{" "}
                    <span className="text-amber-600 font-medium">
                      {orderStats.pinned} pinned
                    </span>
                  </>
                )}
              </span>
              {orderStats.pinned > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                  📌 Pinned orders appear first
                </span>
              )}
            </div>
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
              {filteredAndSortedOrders.map((order) => {
                const hasRoyalSet = order.items?.some(item => item.isRoyalSet);
                
                return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border rounded-lg p-4 shadow-sm ${
                    hasRoyalSet
                      ? "bg-yellow-50 border-yellow-300"
                      : order.pinned
                      ? "border-l-4 border-l-amber-400 bg-amber-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id
                            )
                          }
                          className="text-lg font-bold text-indigo-600 underline"
                        >
                          {order.customer?.fullName}
                        </button>
                        {order.pinned && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-800 bg-amber-100 border border-amber-200 rounded-full">
                            📌 Pinned
                          </span>
                        )}
                        {order.isCollaboration && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 border border-purple-200 rounded-full">
                            🤝 Collaboration
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <button
                          onClick={() => handlePinToggle(order.id)}
                          className={`p-2 rounded-full transition-colors ${
                            order.pinned
                              ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title={
                            order.pinned ? "Unpin order" : "Pin order to top"
                          }
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.customer?.fullName)}
                          className="p-2 rounded-full transition-colors bg-red-100 text-red-600 hover:bg-red-200"
                          title="Delete order"
                        >
                          🗑️
                        </button>
                      </div>
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
                          : order.orderStatus === "cutting"
                          ? "bg-orange-500"
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
                          <option value="work-in-progress">
                            Work in Progress
                          </option>
                          <option value="cutting">Cutting</option>
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
                                      <span
                                        className={`font-bold ${
                                          item.isFullSet
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                        }`}
                                      >
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
                                          {dhotiBrother?.name ||
                                            item.selectedDhoti}
                                        </span>
                                        {item.selectedDhoti &&
                                          !dhotiBrother && (
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
                                    <p className="font-medium text-sm">
                                      📏 Measurements
                                    </p>
                                    <div className="flex gap-1">
                                      {editingMeasurements?.orderId ===
                                        order.id &&
                                      editingMeasurements?.itemIndex === idx ? (
                                        <>
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
                                        </>
                                      ) : (
                                        <>
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
                                          <button
                                            onClick={() =>
                                              sendMeasurementReminder(order.id)
                                            }
                                            disabled={sendingReminder.has(
                                              order.id
                                            )}
                                            className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                          >
                                            {sendingReminder.has(order.id)
                                              ? "Sending..."
                                              : "📧 Remind"}
                                          </button>
                                        </>
                                      )}
                                    </div>
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
                                        💡 Enter measurements in inches as
                                        provided by customer
                                      </p>
                                    </div>
                                  ) : (
                                    // Display Mode
                                    <div>
                                      {item.measurements?.neck ||
                                      item.measurements?.chest ||
                                      item.measurements?.back ? (
                                        <div className="text-sm">
                                          <span className="font-medium">
                                            Neck:
                                          </span>{" "}
                                          {item.measurements.neck || "N/A"}
                                          &quot; •
                                          <span className="font-medium">
                                            Chest:
                                          </span>{" "}
                                          {item.measurements.chest || "N/A"}
                                          &quot; •
                                          <span className="font-medium">
                                            Back:
                                          </span>{" "}
                                          {item.measurements.back || "N/A"}
                                          &quot;
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

                                  {/* Reminder Tracking Info */}
                                  {(order.lastReminderSent ||
                                    order.reminderCount) && (
                                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-purple-700 font-medium">
                                          📧 Reminder History
                                        </span>
                                        <span className="text-purple-600">
                                          Sent {order.reminderCount || 0}{" "}
                                          time(s)
                                        </span>
                                      </div>
                                      {order.lastReminderSent && (
                                        <div className="text-purple-600 mt-1">
                                          Last sent:{" "}
                                          {new Date(
                                            order.lastReminderSent
                                          ).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
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
                          {order.customer?.addressLine2}, {order.customer?.city}
                          , {order.customer?.state} - {order.customer?.pincode}
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
              );
              })}
            </div>
          )}
        </>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && <OrderResumeNotifications />}
      
      {/* Coupons Tab */}
      {activeTab === "coupons" && <CouponManager />}
    </div>
  );
};

export default AdminPage;
