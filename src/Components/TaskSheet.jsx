import React, { useState, useEffect } from "react";
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
} from "lucide-react";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

const DailyTaskSheet = () => {
  const [currentView, setCurrentView] = useState("form"); // 'form' or 'reports'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: "",
    date: new Date().toISOString().split("T")[0],
    tasksCompleted: "",
    timeSpent: "",
    challenges: "",
    achievements: "",
    tomorrowPlan: "",
    overallRating: 5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock data for demo - replace with actual Firebase data
  const mockReports = [
    {
      id: "1",
      employeeName: "John Doe",
      date: "2025-01-15",
      tasksCompleted:
        "Completed user authentication module, Fixed login bugs, Updated documentation",
      timeSpent:
        "4 hours on auth module, 2 hours on bug fixes, 1 hour on documentation",
      challenges: "OAuth integration was trickier than expected",
      achievements: "Successfully implemented secure login system",
      tomorrowPlan: "Start working on dashboard UI, Review pull requests",
      overallRating: "8",
      submittedAt: "2025-01-15T18:30:00Z",
    },
    {
      id: "2",
      employeeName: "Jane Smith",
      date: "2025-01-14",
      tasksCompleted: "Client meeting, Database optimization, Code review",
      timeSpent:
        "2 hours in meetings, 4 hours on database work, 1 hour on code review",
      challenges: "Database queries were running slow, needed optimization",
      achievements: "Improved query performance by 60%",
      tomorrowPlan: "Implement caching layer, Write unit tests",
      overallRating: "9",
      submittedAt: "2025-01-14T17:45:00Z",
    },
    {
      id: "3",
      employeeName: "Mike Johnson",
      date: "2025-01-13",
      tasksCompleted: "API development, Error handling, Testing",
      timeSpent:
        "5 hours on API endpoints, 2 hours on error handling, 1 hour testing",
      challenges: "Complex validation logic required multiple iterations",
      achievements: "All API endpoints now have proper error handling",
      tomorrowPlan: "Documentation update, Performance testing",
      overallRating: "7",
      submittedAt: "2025-01-13T19:00:00Z",
    },
  ];

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
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToReports = () => {
    window.history.pushState({}, "", "/daily-task/report");
    setCurrentView("reports");
    loadReports();
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
          employeeName: "",
          date: new Date().toISOString().split("T")[0],
          tasksCompleted: "",
          timeSpent: "",
          challenges: "",
          achievements: "",
          tomorrowPlan: "",
          overallRating: 5,
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

  // Reports View Component
  const ReportsView = () => (
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
                <p className="text-slate-200">Employee productivity overview</p>
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

          {/* Stats */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {reports.length}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {reports.length > 0
                    ? Math.round(
                        reports.reduce(
                          (acc, r) => acc + parseInt(r.overallRating),
                          0
                        ) / reports.length
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {reports.length > 0
                    ? new Set(reports.map((r) => r.employeeName)).size
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Active Employees</div>
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
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reports submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report, index) => (
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
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(
                        report.overallRating
                      )}`}
                    >
                      {report.overallRating}/10
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Tasks Completed
                      </h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {report.tasksCompleted}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Time Breakdown
                      </h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {report.timeSpent}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Challenges
                      </h4>
                      <p className="text-gray-600 text-sm bg-red-50 p-3 rounded-lg">
                        {report.challenges || "None reported"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Achievements
                      </h4>
                      <p className="text-gray-600 text-sm bg-green-50 p-3 rounded-lg">
                        {report.achievements || "None reported"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Tomorrow's Plan
                    </h4>
                    <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-lg">
                      {report.tomorrowPlan || "No plan specified"}
                    </p>
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
    </div>
  );

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tasks Completed Today
              </label>
              <textarea
                name="tasksCompleted"
                value={formData.tasksCompleted}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="List the main tasks you completed today..."
                required
              />
            </motion.div>

            {/* Time Spent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Breakdown
              </label>
              <textarea
                name="timeSpent"
                value={formData.timeSpent}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="How did you spend your time? (e.g., 3 hours on project A, 2 hours on meetings...)"
                required
              />
            </motion.div>

            {/* Challenges & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Challenges Faced
                </label>
                <textarea
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Any obstacles or difficulties..."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Achievements
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="What went well today..."
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
                Tomorrow's Priority Tasks
              </label>
              <textarea
                name="tomorrowPlan"
                value={formData.tomorrowPlan}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="What do you plan to focus on tomorrow..."
              />
            </motion.div>

            {/* Overall Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Overall Productivity Rating
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">1 (Low)</span>
                <input
                  type="range"
                  name="overallRating"
                  min="1"
                  max="10"
                  value={formData.overallRating}
                  onChange={handleInputChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-600">10 (High)</span>
                <div className="ml-4 px-3 py-1 bg-blue-100 rounded-full">
                  <span className="text-blue-700 font-semibold">
                    {formData.overallRating}
                  </span>
                </div>
              </div>
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
