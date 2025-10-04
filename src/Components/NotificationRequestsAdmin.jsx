import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Bell,
  Mail,
  Users,
  Package,
  Send,
  Trash2,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const NotificationRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, notified
  const [groupedRequests, setGroupedRequests] = useState({});
  const [sendingNotifications, setSendingNotifications] = useState(new Set());

  useEffect(() => {
    fetchNotificationRequests();
  }, []);

  useEffect(() => {
    groupRequestsByProduct();
  }, [requests, filter]);

  const fetchNotificationRequests = async () => {
    try {
      setLoading(true);
      const requestsRef = collection(db, "notificationRequests");
      const snapshot = await getDocs(requestsRef);

      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching notification requests:", error);
      toast.error("Failed to load notification requests");
    } finally {
      setLoading(false);
    }
  };

  const groupRequestsByProduct = () => {
    const filtered = requests.filter((request) => {
      if (filter === "pending") return !request.notified;
      if (filter === "notified") return request.notified;
      return true;
    });

    const grouped = filtered.reduce((acc, request) => {
      const key = `${request.productId}_${request.productName}`;
      if (!acc[key]) {
        acc[key] = {
          productId: request.productId,
          productName: request.productName,
          productImage: request.productImage,
          productType: request.productType,
          requests: [],
        };
      }
      acc[key].requests.push(request);
      return acc;
    }, {});

    setGroupedRequests(grouped);
  };

  const sendIndividualNotification = async (request) => {
    const requestId = request.id;
    setSendingNotifications((prev) => new Set([...prev, requestId]));

    try {
      const response = await fetch("/api/send-restock-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: request.email,
          product: {
            id: request.productId,
            name: request.productName,
            mainImage: request.productImage,
            type: request.productType,
          },
          size: request.size,
          isIndividual: true,
          notificationRequestId: requestId,
        }),
      });

      if (response.ok) {
        // Update the request as notified
        const requestRef = doc(db, "notificationRequests", requestId);
        await updateDoc(requestRef, {
          notified: true,
          notifiedAt: new Date().toISOString(),
          status: "notified",
        });

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  notified: true,
                  notifiedAt: new Date().toISOString(),
                  status: "notified",
                }
              : req
          )
        );

        toast.success(`Notification sent to ${request.email}`);
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(`Failed to send notification to ${request.email}`);
    } finally {
      setSendingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const sendBulkNotifications = async (productGroup) => {
    const pendingRequests = productGroup.requests.filter(
      (req) => !req.notified
    );

    if (pendingRequests.length === 0) {
      toast.error("No pending notifications for this product");
      return;
    }

    const confirmBulk = window.confirm(
      `Send restock notifications to ${pendingRequests.length} customers for ${productGroup.productName}?`
    );

    if (!confirmBulk) return;

    toast.loading(
      `Sending notifications to ${pendingRequests.length} customers...`
    );

    let successCount = 0;
    let failCount = 0;

    for (const request of pendingRequests) {
      try {
        const response = await fetch("/api/send-restock-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: request.email,
            product: {
              id: request.productId,
              name: request.productName,
              mainImage: request.productImage,
              type: request.productType,
            },
            size: request.size,
            isIndividual: false,
          }),
        });

        if (response.ok) {
          // Update the request as notified
          const requestRef = doc(db, "notificationRequests", request.id);
          await updateDoc(requestRef, {
            notified: true,
            notifiedAt: new Date().toISOString(),
            status: "notified",
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Error sending bulk notification:", error);
        failCount++;
      }
    }

    // Update local state for all successfully notified requests
    setRequests((prev) =>
      prev.map((req) => {
        const wasNotified = pendingRequests.find(
          (pr) => pr.id === req.id && successCount > 0
        );
        if (wasNotified) {
          return {
            ...req,
            notified: true,
            notifiedAt: new Date().toISOString(),
            status: "notified",
          };
        }
        return req;
      })
    );

    toast.dismiss();
    if (successCount > 0) {
      toast.success(`Successfully sent ${successCount} notifications`);
    }
    if (failCount > 0) {
      toast.error(`Failed to send ${failCount} notifications`);
    }
  };

  const deleteRequest = async (requestId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification request?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "notificationRequests", requestId));
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Notification request deleted");
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    }
  };

  const getStatusIcon = (request) => {
    if (request.notified) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (request) => {
    if (request.notified) {
      return `Notified ${new Date(request.notifiedAt).toLocaleDateString()}`;
    }
    return "Pending";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Notification Requests
            </h2>
            <p className="text-gray-600">
              Manage customer restock notifications
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="notified">Notified</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {requests.filter((r) => !r.notified).length}
              </p>
              <p className="text-sm text-gray-600">Pending Notifications</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {requests.filter((r) => r.notified).length}
              </p>
              <p className="text-sm text-gray-600">Notified Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {Object.keys(groupedRequests).length}
              </p>
              <p className="text-sm text-gray-600">Products with Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {Object.keys(groupedRequests).length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No notification requests found
            </h3>
            <p className="text-gray-500">
              Customers who request notifications for sold-out products will
              appear here.
            </p>
          </div>
        ) : (
          Object.values(groupedRequests).map((productGroup) => {
            const pendingCount = productGroup.requests.filter(
              (r) => !r.notified
            ).length;
            const totalCount = productGroup.requests.length;

            return (
              <motion.div
                key={`${productGroup.productId}_${productGroup.productName}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Product Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={productGroup.productImage}
                        alt={productGroup.productName}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {productGroup.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {totalCount} total request
                          {totalCount !== 1 ? "s" : ""} • {pendingCount} pending
                        </p>
                      </div>
                    </div>

                    {pendingCount > 0 && (
                      <button
                        onClick={() => sendBulkNotifications(productGroup)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Notify All ({pendingCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* Requests List */}
                <div className="divide-y divide-gray-100">
                  {productGroup.requests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request)}
                          <div>
                            <p className="font-medium text-gray-800">
                              {request.email}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Size: <strong>{request.size}</strong>
                              </span>
                              <span>•</span>
                              <span>{getStatusText(request)}</span>
                              <span>•</span>
                              <span>
                                Requested:{" "}
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!request.notified && (
                          <button
                            onClick={() => sendIndividualNotification(request)}
                            disabled={sendingNotifications.has(request.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            {sendingNotifications.has(request.id) ? (
                              <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            <span className="text-sm">Notify</span>
                          </button>
                        )}

                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationRequestsAdmin;
