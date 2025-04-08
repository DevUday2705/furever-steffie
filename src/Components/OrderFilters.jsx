// OrderFilters.jsx
import { useState } from "react";

const OrderFilters = ({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onCalendarDateChange,
}) => {
  const [calendarDate, setCalendarDate] = useState("");

  const handleCalendarChange = (e) => {
    const selectedDate = e.target.value;
    setCalendarDate(selectedDate);
    onCalendarDateChange(selectedDate);
  };

  return (
    <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg border">
      <h2 className="font-medium text-gray-700 mb-2">Filter Orders</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        {/* Date range filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom Date</option>
          </select>
        </div>

        {/* Calendar filter (shows when custom date is selected) */}
        {dateFilter === "custom" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Select Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={calendarDate}
              onChange={handleCalendarChange}
            />
          </div>
        )}

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
            <option value="delivered">Delivered</option>
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
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
