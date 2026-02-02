import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
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
  const [analytics, setAnalytics] = useState({
    totalUnits: 0,
    topProducts: [],
    topSizes: [],
    orderTypes: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      
      const productCount = {};
      const sizeCount = {};
      const orderTypeCount = {
        'Kurta Only': 0,
        'Full Set': 0,
        'Royal Set': 0,
        'Mixed Orders': 0
      };
      let totalUnits = 0;

      // Convert date strings to Date objects for comparison
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      // Set end date to end of day for inclusive filtering
      endDateObj.setHours(23, 59, 59, 999);

      ordersSnapshot.docs.forEach((doc) => {
        const order = doc.data();
        
        // Check if order is within date range
        const orderDate = new Date(order.createdAt);
        if (orderDate >= startDateObj && orderDate <= endDateObj) {
          // Analyze order type
          if (order.items && Array.isArray(order.items)) {
            const hasRoyalSet = order.items.some(item => item.isRoyalSet);
            const hasFullSet = order.items.some(item => item.isFullSet);
            const hasRegularItems = order.items.some(item => !item.isRoyalSet && !item.isFullSet);
            
            // Categorize the order
            if (hasRoyalSet && !hasFullSet && !hasRegularItems) {
              orderTypeCount['Royal Set']++;
            } else if (hasFullSet && !hasRoyalSet && !hasRegularItems) {
              orderTypeCount['Full Set']++;
            } else if (!hasRoyalSet && !hasFullSet) {
              orderTypeCount['Kurta Only']++;
            } else {
              orderTypeCount['Mixed Orders']++;
            }
            
            // Process each item in the order
            order.items.forEach((item) => {
              // Count total units
              totalUnits += 1;
              
              // Count products
              const productName = item.name || "Unknown Product";
              productCount[productName] = (productCount[productName] || 0) + 1;
              
              // Count sizes
              const size = item.selectedSize || "Unknown Size";
              sizeCount[size] = (sizeCount[size] || 0) + 1;
            });
          }
        }
      });

      // Get top 5 products
      const topProducts = Object.entries(productCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Get top 4 sizes (sorted by count)
      const topSizes = Object.entries(sizeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([size, count]) => ({ size, count }));

      // Get order types data
      const orderTypes = Object.entries(orderTypeCount)
        .filter(([, count]) => count > 0) // Only show types that have orders
        .map(([type, count]) => ({ type, count }));

      setAnalytics({
        totalUnits,
        topProducts,
        topSizes,
        orderTypes
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Overview of your sales performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {/* Quick Date Presets */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(thisMonth.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                setStartDate(lastMonth.toISOString().split('T')[0]);
                setEndDate(lastMonthEnd.toISOString().split('T')[0]);
              }}
              className="px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setStartDate(last30Days.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(last7Days.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              Last 7 Days
            </button>
          </div>
        </div>
        
        {/* Date Range Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            📊 Showing data from{" "}
            <span className="font-semibold text-gray-900">
              {new Date(startDate).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {new Date(endDate).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
            {" "}({Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} days)
          </p>
        </div>
      </div>

      {/* Total Units Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Total Outfits Sold</h3>
            <p className="text-3xl font-bold mt-2">{analytics.totalUnits}</p>
          </div>
          <div className="text-4xl opacity-75">
            👕
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900">Top 5 Products</h3>
          </div>
          
          {analytics.topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No products data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]" title={product.name}>
                        {product.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{product.count}</p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top 4 Sizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📏</div>
            <h3 className="text-xl font-semibold text-gray-900">Top 4 Sizes</h3>
          </div>
          
          {analytics.topSizes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sizes data available</p>
          ) : (
            <div className="space-y-4">
              {analytics.topSizes.map((sizeData, index) => (
                <div key={sizeData.size} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-900 text-lg">{sizeData.size}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{sizeData.count}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                      }`}
                      style={{
                        width: `${(sizeData.count / analytics.topSizes[0].count) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Order Types */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📦</div>
            <h3 className="text-xl font-semibold text-gray-900">Order Types</h3>
          </div>
          
          {analytics.orderTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No order data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.orderTypes.map((orderType, index) => {
                const getTypeColor = (type) => {
                  switch (type) {
                    case 'Royal Set': return 'bg-purple-500';
                    case 'Full Set': return 'bg-yellow-500';
                    case 'Kurta Only': return 'bg-blue-500';
                    case 'Mixed Orders': return 'bg-green-500';
                    default: return 'bg-gray-500';
                  }
                };
                
                const getTypeIcon = (type) => {
                  switch (type) {
                    case 'Royal Set': return '👑';
                    case 'Full Set': return '🎯';
                    case 'Kurta Only': return '👕';
                    case 'Mixed Orders': return '🎪';
                    default: return '📦';
                  }
                };
                
                return (
                  <div key={orderType.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getTypeColor(orderType.type)}`}>
                        <span className="text-xs">{getTypeIcon(orderType.type)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{orderType.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{orderType.count}</p>
                      <p className="text-xs text-gray-500">orders</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
};

export default Analytics;