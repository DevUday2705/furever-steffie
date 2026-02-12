import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  ToggleLeft,
  Save, 
  ArrowLeft,
  Crown,
  Shirt,
   Star,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const GlobalSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    features: {
      kurtaDhotiEnabled: true,
      kurtaDupattaEnabled: true,
      royalSetEnabled: true,
      dhotiManagementEnabled: true,
    },
    lastUpdated: null,
    updatedBy: 'admin'
  });

  // Fetch current settings on component mount
  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(data);
      } else {
        // Initialize with default settings
        const defaultSettings = {
          features: {
            kurtaDhotiEnabled: true,
            kurtaDupattaEnabled: true,
            royalSetEnabled: true,
            dhotiManagementEnabled: true,
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin'
        };
        
        await setDoc(doc(db, 'settings', 'global'), defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
      setMessage({
        type: 'error',
        text: 'Error loading settings. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (featureName) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName]: !prev.features[featureName]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin'
      };
      
      await setDoc(doc(db, 'settings', 'global'), updatedSettings);
      setSettings(updatedSettings);
      
      setMessage({
        type: 'success',
        text: 'Settings saved successfully!'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Error saving settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 h-8 w-8 text-gray-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-6 w-6 mr-2" />
                  Global Settings
                </h1>
                <p className="text-gray-600 text-sm">
                  Manage global features and options for your store
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                saving 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {saving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Product Options Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Product Options Control
              </h2>
              <p className="text-gray-600 text-sm">
                Enable or disable product options globally across all products
              </p>
            </div>

            <div className="space-y-4">
              {/* Kurta + Dhoti Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shirt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Kurta + Dhoti Option</h3>
                    <p className="text-sm text-gray-600">
                      Allow customers to add dhoti with kurta purchases
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => handleToggle('kurtaDhotiEnabled')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.features.kurtaDhotiEnabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{
                      left: settings.features.kurtaDhotiEnabled ? '30px' : '4px'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              {/* Kurta + Dupatta Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Star className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Kurta + Dupatta Option</h3>
                    <p className="text-sm text-gray-600">
                      Allow customers to add dupatta with kurta purchases
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => handleToggle('kurtaDupattaEnabled')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.features.kurtaDupattaEnabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{
                      left: settings.features.kurtaDupattaEnabled ? '30px' : '4px'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              {/* Royal Set Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Crown className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Royal Set Option</h3>
                    <p className="text-sm text-gray-600">
                      Enable premium royal set option for products
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => handleToggle('royalSetEnabled')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.features.royalSetEnabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{
                      left: settings.features.royalSetEnabled ? '30px' : '4px'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              {/* Dhoti Management System Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <ToggleLeft className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Dhoti Management System</h3>
                    <p className="text-sm text-gray-600">
                      Enable centralized dhoti inventory management
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => handleToggle('dhotiManagementEnabled')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.features.dhotiManagementEnabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{
                      left: settings.features.dhotiManagementEnabled ? '30px' : '4px'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Settings Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Important Information
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Changes take effect immediately across all products</li>
              <li>• Disabled options will be hidden from customers during product selection</li>
              <li>• Dhoti inventory is managed separately from product inventory</li>
              <li>• Royal set and dhoti options require inventory availability</li>
              <li>• When Dhoti Management System is disabled, products use their own dhoti configurations</li>
              <li>• Dupatta option works independently of dhoti inventory system</li>
            </ul>
          </motion.div>

          {/* Last Updated Info */}
          {settings.lastUpdated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-sm text-gray-500"
            >
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;