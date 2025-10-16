import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Trash2,
  Clock,
  Users,
  Send,
  Sparkles,
  Gift,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const OrderResumeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

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

  const handleSendEmailBlast = async () => {
    if (notifications.length === 0) {
      toast.error("No email addresses to send to");
      return;
    }

    setSendingEmails(true);
    try {
      const response = await fetch("/api/send-diwali-launch-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: notifications.map((n) => ({
            email: n.email,
            name: n.name || "Pet Parent",
          })),
        }),
      });

      if (response.ok) {
        toast.success(
          `🎉 Diwali launch emails sent to ${notifications.length} customers!`
        );
      } else {
        throw new Error("Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending email blast:", error);
      toast.error("Failed to send emails. Please try again.");
    } finally {
      setSendingEmails(false);
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Order Resume Notifications
          </h2>
          {notifications.length > 0 && (
            <button
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-sm"
            >
              <Mail className="w-4 h-4" />
              {showEmailPreview ? "Hide Preview" : "Send Diwali Launch Email"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{notifications.length} people waiting</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>Ready for Diwali launch announcement</span>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-orange-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                🪔 Diwali Launch Email Preview
              </h3>
              <p className="text-sm text-gray-600">
                This email will be sent to {notifications.length} customers
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mb-4 shadow-sm border">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 We&apos;re Back with Diwali Magic!
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mx-auto"></div>
            </div>

            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>Dear [Customer Name],</strong>
              </p>

              <p>
                Great news! 🎊 Orders are officially LIVE again, and we have
                something special just for you!
              </p>

              <div className="bg-gradient-to-r from-orange-100 to-rose-100 rounded-lg p-4 my-4">
                <h4 className="font-bold text-orange-800 mb-2">
                  🪔 Exclusive Diwali Collection Launch
                </h4>
                <p className="text-orange-700">
                  We&apos;ve launched beautiful new festive outfits perfect for
                  Diwali celebrations!
                </p>
              </div>

              <p>
                <strong>🎁 Special Launch Offer Just for You:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>FUREVER5</strong> - Get flat 5% OFF on all orders
                </li>
                <li>
                  <strong>FREE AIR Delivery</strong> - Aiming for delivery
                  by/before Diwali
                </li>
                <li>
                  <strong>Same/Next Day Dispatch</strong> - No more waiting!
                </li>
              </ul>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <p className="text-rose-800">
                  <strong>💡 Pro Tip:</strong> Use our new size filter on the
                  products page to find outfits available in your pet&apos;s
                  size instantly!
                </p>
              </div>

              <p>
                Visit our products page, filter by your pet&apos;s size, and
                place your order today. Your furry friend deserves to shine this
                Diwali! ✨
              </p>

              <p>
                Happy Shopping & Happy Diwali! 🪔
                <br />
                <strong>Team Furever</strong>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEmailPreview(false)}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmailBlast}
              disabled={sendingEmails}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {sendingEmails ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to {notifications.length} Customers
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

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
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            🪔 Diwali Launch Ready
          </h4>
          <p className="text-sm text-orange-800 mb-3">
            {notifications.length} customers are waiting for the big
            announcement! Send them the exclusive Diwali collection launch email
            with special offers.
          </p>
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <Gift className="w-3 h-3" />
            <span>Includes FUREVER5 discount code & FREE delivery promise</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderResumeNotifications;
