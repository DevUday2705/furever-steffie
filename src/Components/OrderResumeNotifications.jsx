import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { Mail, Trash2, Clock, Users } from "lucide-react";
import toast from "react-hot-toast";

const OrderResumeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "order-resume-notifications")
      );
      const notificationsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(
        notificationsList.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "order-resume-notifications", notificationId));
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("Notification request deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification request");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading notification requests...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Order Resume Notifications
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{notifications.length} people waiting</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>Ready to notify when orders resume</span>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notification requests
          </h3>
          <p className="text-gray-500">
            When customers can&apos;t place orders, they&apos;ll sign up here to
            be notified.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {notification.name || "Pet Parent"}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Waiting
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.email}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(notification.timestamp).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete notification request"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-blue-800">
            When you resume orders, consider sending a broadcast email to all
            these customers first! They&apos;ve been waiting patiently and
            deserve priority access.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderResumeNotifications;
