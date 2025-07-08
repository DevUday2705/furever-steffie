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

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

  const handleCalendarDateChange = (selectedDate) => {
    setCustomDate(selectedDate ? new Date(selectedDate) : null);
  };

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
      const now = new Date();
      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === "last7") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === "last30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = orderDate >= thirtyDaysAgo;
      } else if (dateFilter === "custom" && customDate) {
        matchesDate =
          orderDate.getFullYear() === customDate.getFullYear() &&
          orderDate.getMonth() === customDate.getMonth() &&
          orderDate.getDate() === customDate.getDate();
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
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onCalendarDateChange={handleCalendarDateChange}
      />
      {
        <span className="my-2 text-gray-500 inline-block italic">
          {orders.length} orders
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
                <div>
                  <button
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.id ? null : order.id
                      )
                    }
                    className="text-sm font-bold text-indigo-600 underline"
                  >
                    {order.customer?.fullName}
                  </button>
                  <div className="text-xs text-gray-500 mb-2">
                    {order.customer?.mobileNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">₹{order.amount}</div>
                  <div className="text-xs text-gray-500">
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

              <div className="mt-2 text-[10px] text-gray-400">
                {new Date(order.createdAt).toLocaleString()}
              </div>

              {expandedOrderId === order.id && (
                <div className="mt-4 border-t pt-3 text-xs text-gray-700 space-y-2">
                  <div>
                    <p className="font-semibold">Customer Details</p>
                    <p>Name: {order.customer?.fullName}</p>
                    <p>Phone: {order.customer?.mobileNumber}</p>
                    <p>Alt Phone: {order.customer?.alternateMobile}</p>
                    <p>
                      Address: {order.customer?.addressLine1},{" "}
                      {order.customer?.addressLine2}, {order.customer?.city},{" "}
                      {order.customer?.state} - {order.customer?.pincode}
                    </p>
                    <p>Instructions: {order.customer?.specialInstructions}</p>
                    <p>Delivery: {order.customer?.deliveryOption}</p>
                  </div>

                  <div>
                    <p className="font-semibold mt-2">Items Ordered</p>
                    <div className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="border p-2 rounded bg-gray-50"
                        >
                          <p className="font-medium">{item.name}</p>
                          <p>Size: {item.selectedSize}</p>
                          <p>Price: ₹{item.price}</p>
                          <p>
                            Beaded: {item.isBeaded ? "Yes" : "No"}, Full Set:{" "}
                            {item.isFullSet ? "Yes" : "No"}
                          </p>
                          <p>
                            Dhoti : {item.selectedDhoti && item.selectedDhoti}
                          </p>
                          <p>
                            Selected Color/Frock Color :{" "}
                            {item.selectedColor && item.selectedColor}
                          </p>
                          {/* 👇 ADD this here 👇 */}
                          {item.measurements && (
                            <div className="text-[11px] text-gray-600 mt-1">
                              <p>Measurements:</p>
                              <p>
                                Neck: {item.measurements.neck}" • Chest:{" "}
                                {item.measurements.chest}" • Back:{" "}
                                {item.measurements.back}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
