import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { Copy, Eye, EyeOff, Clock, User, Gift, CheckCircle, XCircle } from 'lucide-react';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    couponCode: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    discountAmount: '',
    validityHours: '24',
    notes: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'customCoupons'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const couponList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCoupons(couponList);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.couponCode.trim()) {
      newErrors.couponCode = 'Coupon code is required';
    } else if (formData.couponCode.length < 3) {
      newErrors.couponCode = 'Coupon code must be at least 3 characters';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.discountAmount || formData.discountAmount <= 0) {
      newErrors.discountAmount = 'Valid discount amount is required';
    }

    if (!formData.validityHours || formData.validityHours <= 0) {
      newErrors.validityHours = 'Valid time period is required';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate coupon code when customer name changes
    if (name === 'customerName' && value) {
      const firstName = value.split(' ')[0].toUpperCase();
      const suggestedCode = `${firstName}${formData.discountAmount || '50'}`;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        couponCode: suggestedCode
      }));
    } else if (name === 'discountAmount' && formData.customerName) {
      const firstName = formData.customerName.split(' ')[0].toUpperCase();
      const suggestedCode = `${firstName}${value || '50'}`;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        couponCode: suggestedCode
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(formData.validityHours));
      
      const couponData = {
        couponCode: formData.couponCode.toUpperCase(),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || null,
        customerPhone: formData.customerPhone || null,
        discountAmount: parseInt(formData.discountAmount),
        discountType: 'flat', // Always flat discount in rupees
        validityHours: parseInt(formData.validityHours),
        expiryDate: expiryDate.toISOString(),
        isUsed: false,
        usedAt: null,
        usedBy: null,
        orderId: null,
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
        createdBy: 'admin' // You can modify this to track which admin created it
      };

      await addDoc(collection(db, 'customCoupons'), couponData);
      
      toast.success(`🎉 Coupon ${formData.couponCode.toUpperCase()} created successfully!`);
      
      // Reset form
      setFormData({
        couponCode: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        discountAmount: '',
        validityHours: '24',
        notes: ''
      });
      
      setShowCreateForm(false);
      fetchCoupons(); // Refresh the list
      
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (coupon) => {
    if (coupon.isUsed) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 border border-green-200 rounded-full">
          <CheckCircle size={12} className="mr-1" />
          Used
        </span>
      );
    } else if (isExpired(coupon.expiryDate)) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 border border-red-200 rounded-full">
          <XCircle size={12} className="mr-1" />
          Expired
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full">
          <Clock size={12} className="mr-1" />
          Active
        </span>
      );
    }
  };

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Custom Coupon Manager</h1>
        <p className="text-gray-600">Create personalized discount coupons for specific customers</p>
      </div>

      {/* Create Coupon Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <Gift size={18} className="mr-2" />
          {showCreateForm ? 'Cancel' : 'Create New Coupon'}
        </button>
      </div>

      {/* Create Coupon Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Create Custom Coupon</h3>
          </div>
          
          <form onSubmit={createCoupon} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md text-sm ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Uday Kumar"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
                )}
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md text-sm ${
                    errors.couponCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., UDAY50"
                />
                {errors.couponCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.couponCode}</p>
                )}
              </div>

              {/* Discount Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount (₹) *
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-2 border rounded-md text-sm ${
                    errors.discountAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 50"
                />
                {errors.discountAmount && (
                  <p className="mt-1 text-xs text-red-500">{errors.discountAmount}</p>
                )}
              </div>

              {/* Validity Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid for (Hours) *
                </label>
                <select
                  name="validityHours"
                  value={formData.validityHours}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md text-sm ${
                    errors.validityHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="1">1 Hour</option>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="72">72 Hours</option>
                  <option value="168">1 Week</option>
                </select>
                {errors.validityHours && (
                  <p className="mt-1 text-xs text-red-500">{errors.validityHours}</p>
                )}
              </div>

              {/* Customer Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md text-sm ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="customer@example.com"
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerEmail}</p>
                )}
              </div>

              {/* Customer Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Any additional notes about this coupon..."
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">All Coupons</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Gift size={32} className="mx-auto mb-2 opacity-50" />
            <p>No coupons created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code & Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-mono font-semibold text-blue-600">
                            {coupon.couponCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.couponCode)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 flex items-center mt-1">
                          <User size={14} className="mr-1" />
                          {coupon.customerName}
                        </div>
                        {coupon.customerEmail && (
                          <div className="text-xs text-gray-500">{coupon.customerEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-green-600">
                        ₹{coupon.discountAmount}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="text-gray-700">
                          {coupon.validityHours}h validity
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires: {formatDateTime(coupon.expiryDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(coupon)}
                      {coupon.isUsed && (
                        <div className="text-xs text-gray-500 mt-1">
                          Used: {formatDateTime(coupon.usedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => copyToClipboard(
                          `Hi ${coupon.customerName}! Use code ${coupon.couponCode} for ₹${coupon.discountAmount} off. Valid until ${formatDateTime(coupon.expiryDate)}. Happy shopping!`
                        )}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        title="Copy message for customer"
                      >
                        Copy Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManager;