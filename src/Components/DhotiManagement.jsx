import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Package,
  Plus,
  Minus,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Loader,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const SIZES = ['XS', 'S', 'M', 'L'];
const DHOTI_STYLES = [
  {
    id: 'white',
    name: 'White',
    color: '#FFFFFF',
    borderColor: '#E5E7EB'
  },
  {
    id: 'black',
    name: 'Black',
    color: '#000000',
    borderColor: '#374151'
  },
  {
    id: 'gold',
    name: 'Gold',
    color: '#F59E0B',
    borderColor: '#D97706'
  }
];

const DhotiManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState({});
  const [originalInventory, setOriginalInventory] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDhotiInventory();
  }, []);

  const fetchDhotiInventory = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'dhotis', 'inventory');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setInventory(data);
        setOriginalInventory(data);
        setLastUpdated(data.lastUpdated || null);
      } else {
        // Initialize with default inventory
        const defaultInventory = {
          white: {
            id: 'white',
            name: 'White',
            image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_02_21_PM_qqy08k.webp',
            inventory: { XS: 5, S: 10, M: 10, L: 0 }
          },
          black: {
            id: 'black',
            name: 'Black', 
            image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp',
            inventory: { XS: 0, S: 5, M: 0, L: 0 }
          },
          gold: {
            id: 'gold',
            name: 'Gold',
            image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp',
            inventory: { XS: 0, S: 0, M: 0, L: 0 }
          },
          lastUpdated: new Date().toISOString()
        };
        
        await setDoc(docRef, defaultInventory);
        setInventory(defaultInventory);
        setOriginalInventory(defaultInventory);
      }
    } catch (error) {
      console.error('Error fetching dhoti inventory:', error);
      showMessage('error', 'Error loading dhoti inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const updateQuantity = (dhotiId, size, change) => {
    setInventory(prev => {
      const currentStock = prev[dhotiId]?.inventory[size] || 0;
      const newStock = Math.max(0, currentStock + change);
      
      return {
        ...prev,
        [dhotiId]: {
          ...prev[dhotiId],
          inventory: {
            ...prev[dhotiId].inventory,
            [size]: newStock
          }
        }
      };
    });
  };

  const setQuantity = (dhotiId, size, quantity) => {
    const numQuantity = Math.max(0, parseInt(quantity) || 0);
    setInventory(prev => ({
      ...prev,
      [dhotiId]: {
        ...prev[dhotiId],
        inventory: {
          ...prev[dhotiId].inventory,
          [size]: numQuantity
        }
      }
    }));
  };

  const saveInventory = async () => {
    try {
      setSaving(true);
      const updatedInventory = {
        ...inventory,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin'
      };
      
      await setDoc(doc(db, 'dhotis', 'inventory'), updatedInventory);
      setInventory(updatedInventory);
      setOriginalInventory(updatedInventory);
      setLastUpdated(updatedInventory.lastUpdated);
      setEditMode(false);
      
      showMessage('success', 'Dhoti inventory updated successfully!');
    } catch (error) {
      console.error('Error saving inventory:', error);
      showMessage('error', 'Error saving inventory. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setInventory(originalInventory);
    setEditMode(false);
  };

  const hasChanges = () => {
    return JSON.stringify(inventory) !== JSON.stringify(originalInventory);
  };

  const getTotalStock = (dhotiId) => {
    if (!inventory[dhotiId]) return 0;
    return Object.values(inventory[dhotiId].inventory).reduce((sum, stock) => sum + (stock || 0), 0);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600 bg-red-50', label: 'Out of Stock' };
    if (stock <= 3) return { status: 'low', color: 'text-yellow-600 bg-yellow-50', label: 'Low Stock' };
    return { status: 'good', color: 'text-green-600 bg-green-50', label: 'In Stock' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 h-8 w-8 text-gray-600" />
          <p className="text-gray-600">Loading dhoti inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                  <Package className="h-6 w-6 mr-2" />
                  Dhoti Inventory Management
                </h1>
                <p className="text-gray-600 text-sm">
                  Manage centralized dhoti inventory and stock levels
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges() && (
                <motion.button
                  onClick={resetChanges}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Changes
                </motion.button>
              )}
              
              {editMode ? (
                <motion.button
                  onClick={saveInventory}
                  disabled={saving || !hasChanges()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    saving || !hasChanges()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setEditMode(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-black text-white rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Inventory</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Message Display */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {DHOTI_STYLES.map((style, index) => {
            const dhotiData = inventory[style.id];
            const totalStock = getTotalStock(style.id);
            
            return (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2"
                        style={{ 
                          backgroundColor: style.color,
                          borderColor: style.borderColor 
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{style.name} Dhoti</h3>
                        <p className="text-sm text-gray-600">Total Stock: {totalStock}</p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs ${getStockStatus(totalStock).color}`}>
                      {getStockStatus(totalStock).label}
                    </div>
                  </div>
                </div>

                {/* Size Inventory */}
                <div className="p-6">
                  <div className="space-y-4">
                    {SIZES.map(size => {
                      const stock = dhotiData?.inventory[size] || 0;
                      const stockInfo = getStockStatus(stock);
                      
                      return (
                        <div key={size} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-700 w-8">{size}</span>
                            <div className={`px-2 py-1 rounded text-xs ${stockInfo.color}`}>
                              {stock} units
                            </div>
                          </div>
                          
                          {editMode ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(style.id, size, -1)}
                                disabled={stock === 0}
                                className={`p-1 rounded transition-colors ${
                                  stock === 0 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setQuantity(style.id, size, e.target.value)}
                                className="w-16 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              
                              <button
                                onClick={() => updateQuantity(style.id, size, 1)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(inventory).reduce((total, dhoti) => 
                  total + Object.values(dhoti?.inventory || {}).reduce((sum, stock) => sum + (stock || 0), 0), 0
                )}
              </div>
              <div className="text-sm text-blue-700">Total Units</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(inventory).filter(dhoti => 
                  Object.values(dhoti?.inventory || {}).some(stock => (stock || 0) > 3)
                ).length}
              </div>
              <div className="text-sm text-green-700">Well Stocked</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(inventory).filter(dhoti => 
                  Object.values(dhoti?.inventory || {}).some(stock => (stock || 0) > 0 && (stock || 0) <= 3)
                ).length}
              </div>
              <div className="text-sm text-yellow-700">Low Stock</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(inventory).filter(dhoti => 
                  Object.values(dhoti?.inventory || {}).every(stock => (stock || 0) === 0)
                ).length}
              </div>
              <div className="text-sm text-red-700">Out of Stock</div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        {lastUpdated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DhotiManagement;