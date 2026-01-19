import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NotificationPermissionDialog = () => {
  const { 
    showNotificationPermission, 
    setShowNotificationPermission, 
    requestNotificationPermission 
  } = useAppContext();

  const handleEnable = async () => {
    await requestNotificationPermission();
  };

  const handleDismiss = () => {
    setShowNotificationPermission(false);
    localStorage.setItem('notificationPermissionAsked', 'true');
  };

  return (
    <AnimatePresence>
      {showNotificationPermission && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative"
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Enable Push Notifications
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center mb-6 text-sm">
                Receive instant updates with alerts on desktop or mobile. We'll notify you about your cart and special offers for your furry friend!
              </p>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleEnable}
                  className="flex-1 py-2.5 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors text-sm"
                >
                  Enable
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPermissionDialog;