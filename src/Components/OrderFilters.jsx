// OrderFilters.jsx
import { useState, useEffect } from "react";

const OrderFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  measurementFilter,
  setMeasurementFilter,
  collaborationFilter,
  setCollaborationFilter,
  onDateRangeChange,
}) => {
  // Get current month start and today's date as defaults
  const getCurrentMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  };

  const getTodaysDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getCurrentMonthStart());
  const [endDate, setEndDate] = useState(getTodaysDate());

  // Update parent component when date range changes
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateRangeChange]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // If start date is after end date, update end date
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // If end date is before start date, update start date
    if (newEndDate < startDate) {
      setStartDate(newEndDate);
    }
  };

  const setToday = () => {
    const today = getTodaysDate();
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go to Sunday

    setStartDate(startOfWeek.toISOString().split("T")[0]);
    setEndDate(getTodaysDate());
  };

  const setThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(startOfMonth.toISOString().split("T")[0]);
    setEndDate(getTodaysDate());
  };

  const setThisYear = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    setStartDate(startOfYear.toISOString().split("T")[0]);
    setEndDate(getTodaysDate());
  };

  return (
    <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg border">
      <h2 className="font-medium text-gray-700 mb-2">Filter Orders</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search by name or phone */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name or phone"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>

        {/* Order status filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Order Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="cutting">Cutting</option>
            <option value="ready-to-ship">Ready to Ship</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>

        {/* Collaboration filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Order Type
          </label>
          <select
            value={collaborationFilter}
            onChange={(e) => setCollaborationFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Orders</option>
            <option value="collaboration">🤝 Collaboration</option>
            <option value="regular">💳 Regular Orders</option>
          </select>
        </div>

        {/* Measurement filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Measurements
          </label>
          <select
            value={measurementFilter}
            onChange={(e) => setMeasurementFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Orders</option>
            <option value="has-measurements">Has Measurements</option>
            <option value="no-measurements">No Measurements</option>
          </select>
        </div>

        {/* Sort by option */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
            <option value="dispatch-earliest">Dispatch Date (Earliest)</option>
            <option value="dispatch-latest">Dispatch Date (Latest)</option>
          </select>
        </div>
      </div>

      {/* Date Range Section */}
      <div className="border-t pt-3 mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={setToday}
              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200 font-medium transition-colors"
            >
              📅 Today
            </button>
            <button
              onClick={setThisWeek}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 font-medium transition-colors"
            >
              📆 This Week
            </button>
            <button
              onClick={setThisMonth}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 font-medium transition-colors"
            >
              📊 This Month
            </button>
            <button
              onClick={setThisYear}
              className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-200 font-medium transition-colors"
            >
              📈 This Year
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Custom Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                📅 From Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                📅 To Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate} // Prevent selecting end date before start date
              />
            </div>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-blue-700">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Selected Range:</span>
            </div>
            <div className="text-blue-800 font-medium">
              {new Date(startDate).toLocaleDateString()} -{" "}
              {new Date(endDate).toLocaleDateString()}
            </div>
          </div>
          {startDate && endDate && (
            <div className="mt-2 text-xs text-blue-600 flex items-center justify-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Duration:{" "}
              {Math.ceil(
                (new Date(endDate) - new Date(startDate)) /
                  (1000 * 60 * 60 * 24)
              ) + 1}{" "}
              days
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
