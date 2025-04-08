import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // make sure path is correct
import { motion } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const ADMIN_KEY = "030527";

const AdminPage = () => {
  const [passkey, setPasskey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
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
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
      });

      // Update state locally so UI reflects change immediately
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Try again.");
    }
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
      <h1 className="text-xl font-bold mb-4">📦 Orders</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Search by name or phone"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
            </select>
          </div>

          {orders
            .filter((order) => {
              const nameMatch = order.customer?.fullName
                ?.toLowerCase()
                .includes(searchQuery);
              const phoneMatch = order.customer?.mobileNumber
                ?.toLowerCase()
                .includes(searchQuery);
              const matchesSearch = nameMatch || phoneMatch;

              const createdAt = new Date(order.createdAt);
              const now = new Date();
              let matchesDate = true;

              if (dateFilter === "today") {
                matchesDate = createdAt.toDateString() === now.toDateString();
              } else if (dateFilter === "last7") {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                matchesDate = createdAt >= sevenDaysAgo;
              }

              return matchesSearch && matchesDate;
            })
            .map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-lg p-4 shadow-sm"
              >
                <div className="text-sm font-semibold text-gray-800">
                  {order.customer?.fullName}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {order.customer?.mobileNumber}
                </div>

                <div className="text-xs text-gray-600">
                  {order.items?.length} item(s) | ₹{order.amount}
                </div>

                <div className="mt-3 text-xs">
                  <label className="text-gray-500">Status: </label>
                  <div className="mt-3 text-xs">
                    <label className="text-gray-500">Status: </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-[10px] font-semibold
      ${
        order.status === "pending"
          ? "bg-gray-400"
          : order.status === "work-in-progress"
          ? "bg-yellow-500"
          : order.status === "ready-to-ship"
          ? "bg-indigo-500"
          : order.status === "delivered"
          ? "bg-green-600"
          : "bg-gray-300"
      }
    `}
                      >
                        {order.status}
                      </span>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="text-xs bg-white border border-gray-300 px-2 py-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="work-in-progress">
                          Work in Progress
                        </option>
                        <option value="ready-to-ship">Ready to Ship</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
