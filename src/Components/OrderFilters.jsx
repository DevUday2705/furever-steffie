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

  const resetToCurrentMonth = () => {
    setStartDate(getCurrentMonthStart());
    setEndDate(getTodaysDate());
  };

  const setToday = () => {
    const today = getTodaysDate();
    setStartDate(today);
    setEndDate(today);
  };

  const setLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    setStartDate(sevenDaysAgo.toISOString().split("T")[0]);
    setEndDate(getTodaysDate());
  };

  const setLast30Days = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setEndDate(getTodaysDate());
  };

  return (
    <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg border">
      <h2 className="font-medium text-gray-700 mb-2">Filter Orders</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <option value="work-in-progress">Work in Progress</option>
            <option value="ready-to-ship">Ready to Ship</option>
            <option value="shipped">Shipped</option>
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
          <div className="flex gap-2">
            <button
              onClick={resetToCurrentMonth}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Current Month
            </button>
            <button
              onClick={setToday}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            >
              Today
            </button>
            <button
              onClick={setLast7Days}
              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
            >
              Last 7 Days
            </button>
            <button
              onClick={setLast30Days}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate} // Prevent selecting end date before start date
            />
          </div>
        </div>

        {/* Date Range Info */}
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">Selected Range:</span>{" "}
          {new Date(startDate).toLocaleDateString()} to{" "}
          {new Date(endDate).toLocaleDateString()}
          {startDate && endDate && (
            <span className="ml-2 text-blue-600">
              (
              {Math.ceil(
                (new Date(endDate) - new Date(startDate)) /
                  (1000 * 60 * 60 * 24)
              ) + 1}{" "}
              days)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
