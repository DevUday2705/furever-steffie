import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  FileText,
  Calendar,
  User,
  TrendingUp,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";

const DailyTaskSheet = () => {
  const [currentView, setCurrentView] = useState("form"); // 'form' or 'reports'
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]); // NEW: For filtered reports
  const [loading, setLoading] = useState(false);

  // NEW: Date range filter state
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: "",
  });

  const [formData, setFormData] = useState({
    employeeName: "Rinal",
    date: new Date().toISOString().split("T")[0],

    completedBows: "",
    completedTassels: "",
    completedKurtas: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Simulate URL routing
  useEffect(() => {
    const path = window.location.pathname || "/";
    if (path === "/daily-task/report") {
      setCurrentView("reports");
      loadReports();
    } else {
      setCurrentView("form");
    }
  }, []);

  // Load reports function
  const loadReports = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "dailyReports"),
        orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);
      setFilteredReports(reportsData); // Initialize filtered reports
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }; // No dependencies to prevent loops

  // Memoize date filter values to prevent unnecessary re-renders
  const memoizedDateFilter = useMemo(
    () => ({
      fromDate: dateFilter.fromDate,
      toDate: dateFilter.toDate,
    }),
    [dateFilter.fromDate, dateFilter.toDate]
  );

  // Apply date filter whenever dateFilter changes (optimize to prevent unnecessary re-renders)
  useEffect(() => {
    if (reports.length === 0) return; // Don't filter if no reports

    let filtered = [...reports]; // Create a copy to avoid mutation

    if (memoizedDateFilter.fromDate || memoizedDateFilter.toDate) {
      filtered = reports.filter((report) => {
        if (!report.date) return false; // Skip reports without date

        const reportDate = new Date(report.date);

        // Validate date
        if (isNaN(reportDate.getTime())) return false;

        const fromDate = memoizedDateFilter.fromDate
          ? new Date(memoizedDateFilter.fromDate)
          : null;
        const toDate = memoizedDateFilter.toDate
          ? new Date(memoizedDateFilter.toDate)
          : null;

        // Set time to start/end of day for accurate comparison
        if (fromDate) {
          fromDate.setHours(0, 0, 0, 0);
          if (isNaN(fromDate.getTime())) return false;
        }
        if (toDate) {
          toDate.setHours(23, 59, 59, 999);
          if (isNaN(toDate.getTime())) return false;
        }

        reportDate.setHours(0, 0, 0, 0);

        const afterFromDate = !fromDate || reportDate >= fromDate;
        const beforeToDate = !toDate || reportDate <= toDate;

        return afterFromDate && beforeToDate;
      });
    }

    // Only update if the filtered results actually changed
    setFilteredReports((prevFiltered) => {
      const isSame =
        prevFiltered.length === filtered.length &&
        prevFiltered.every(
          (report, index) => report.id === filtered[index]?.id
        );
      return isSame ? prevFiltered : filtered;
    });
  }, [memoizedDateFilter, reports]);

  // NEW: Function to apply date range filter

  // NEW: Handle date filter changes
  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter({
      ...dateFilter,
      [name]: value,
    });
    // Filter will be applied automatically via useEffect
  };

  // NEW: Reset date filter
  const resetDateFilter = () => {
    setDateFilter({ fromDate: "", toDate: "" });
    // Filter will be reset automatically via useEffect
  };

  const navigateToReports = () => {
    window.history.pushState({}, "", "/daily-task/report");
    setCurrentView("reports");
    loadReports(); // Load reports when navigating to reports view
  };

  const navigateToForm = () => {
    window.history.pushState({}, "", "/");
    setCurrentView("form");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "dailyReports"), {
        ...formData,
        timestamp: new Date(),
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          employeeName: "Rinal",
          date: new Date().toISOString().split("T")[0],
          completedBows: "",
          completedTassels: "",
          completedKurtas: "",
          notes: "",
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRatingColor = (rating) => {
    const num = parseInt(rating);
    if (num >= 8) return "text-green-600 bg-green-100";
    if (num >= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const calculateTotals = (reports) => {
    return reports.reduce(
      (totals, report) => {
        const completedKurtas = parseInt(report.completedKurtas) || 0;
        const totalKurtas = completedKurtas;
        return {
          totalKurtas: totals.totalKurtas + totalKurtas,
          totalTassels:
            totals.totalTassels + (parseInt(report.completedTassels) || 0),
          totalBows: totals.totalBows + (parseInt(report.completedBows) || 0),
        };
      },
      { totalKurtas: 0, totalTassels: 0, totalBows: 0 }
    );
  };

  const getKurtaTotal = (report) => {
    const completed = parseInt(report.completedKurtas) || 0;

    return completed;
  };

  // Reports View Component
  const ReportsView = () => {
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Use filtered reports for calculations and display
    const displayReports =
      filteredReports.length > 0 || dateFilter.fromDate || dateFilter.toDate
        ? filteredReports
        : reports;
    const totals = calculateTotals(displayReports);

    const handleDeleteReport = async (reportId) => {
      try {
        // Delete from Firebase dailyReports collection
        await deleteDoc(doc(db, "dailyReports", reportId));

        // Update local state to remove the deleted report
        const updatedReports = reports.filter((r) => r.id !== reportId);
        setReports(updatedReports);

        // Update filtered reports as well
        const updatedFilteredReports = filteredReports.filter(
          (r) => r.id !== reportId
        );
        setFilteredReports(updatedFilteredReports);

        // Close confirmation modal
        setDeleteConfirm(null);

        // Optional: Show success notification
        console.log("Report deleted successfully");
      } catch (error) {
        console.error("Error deleting report:", error);
        // Handle error (show notification, etc.)
        alert("Error deleting report. Please try again.");
      }
    };

    const confirmDelete = (report) => {
      setDeleteConfirm(report);
    };

    const cancelDelete = () => {
      setDeleteConfirm(null);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Daily Task Reports
                  </h1>
                  <p className="text-slate-200">Production tracking overview</p>
                </div>
                <button
                  onClick={navigateToForm}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Form</span>
                </button>
              </div>
            </div>

            {/* Production Stats */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {totals.totalKurtas}
                  </div>
                  <div className="text-sm text-gray-600">Total Kurtas</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {totals.totalTassels}
                  </div>
                  <div className="text-sm text-gray-600">Total Tassels</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">
                    {totals.totalBows}
                  </div>
                  <div className="text-sm text-gray-600">Total Bows</div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Date Range Filter
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={dateFilter.fromDate}
                    onChange={handleDateFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={dateFilter.toDate}
                    onChange={handleDateFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <button
                    onClick={resetDateFilter}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
                <div>
                  <div className="text-sm text-gray-600">
                    {displayReports.length} of {reports.length} reports
                    {(dateFilter.fromDate || dateFilter.toDate) && (
                      <span className="block text-indigo-600 font-medium">
                        (Filtered)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reports...</p>
            </div>
          ) : displayReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {reports.length === 0
                  ? "No reports submitted yet."
                  : "No reports found for the selected date range."}
              </p>
              {reports.length > 0 && displayReports.length === 0 && (
                <button
                  onClick={resetDateFilter}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {displayReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Report Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {report.employeeName}
                          </h3>
                          <div className="flex items-center space-x-2 text-blue-100">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {formatDate(report.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={() => confirmDelete(report)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-100 hover:text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="p-6 space-y-4">
                    {/* Production Numbers */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Production Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {getKurtaTotal(report)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Kurtas
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.completedKurtas}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {report.completedTassels}
                          </div>
                          <div className="text-xs text-gray-600">Tassels</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {report.completedBows}
                          </div>
                          <div className="text-xs text-gray-600">Bows</div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Notes
                      </h4>
                      <p>{report.notes}</p>
                    </div>

                    <div className="pt-2 text-xs text-gray-500 border-t">
                      Submitted: {new Date(report.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Report
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete the report for{" "}
                  <span className="font-semibold">
                    {deleteConfirm.employeeName}
                  </span>{" "}
                  from {formatDate(deleteConfirm.date)}?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  // Show reports view if on reports route
  if (currentView === "reports") {
    return <ReportsView />;
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Report Submitted!
          </h2>
          <p className="text-gray-600">
            Thank you for your daily update. Have a great evening!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Daily Task Report
                </h1>
                <p className="text-blue-100">End of day summary</p>
              </div>
              <button
                onClick={navigateToReports}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Reports</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            {/* Employee Name & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee Name
                </label>
                <input
                  type="text"
                  disabled
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>
            </div>

            {/* Tasks Completed */}

            {/* Time Spent */}

            {/* Challenges & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Completed Bows
                </label>
                <input
                  type="number"
                  name="completedBows"
                  value={formData.challenges}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Completed Bows"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Completed Tassels
                </label>
                <input
                  name="completedTassels"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Completed Tassels"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Completed Kurtas
                </label>
                <input
                  name="completedKurtas"
                  value={formData.achievements}
                  type="number"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Completed Kurtas"
                />
              </motion.div>
            </div>

            {/* Tomorrow's Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                type="number"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Notes"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-4"
            >
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Daily Report</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyTaskSheet;
