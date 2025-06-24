import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import FeedbackComments from "./FeedbackComments";
import toast from "react-hot-toast";
import axios from "axios";

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Enhanced state for advanced features
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    sentiment: "all",
    acknowledged: "all",
    dateRange: "all",
    tags: [],
  });
  const [sortBy, setSortBy] = useState("date_desc");
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState("card"); // card, list, detailed
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/feedback/");
      setFeedback(response.data.feedback);
      setError("");
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setError("Failed to load feedback");
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleAcknowledge = async (feedbackId) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/feedback/${feedbackId}/acknowledge`),
        {
          method: "POST",
          headers: {
            "X-User-ID": user.id.toString(),
          },
        }
      );

      if (response.ok) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === feedbackId ? { ...item, acknowledged: true } : item
          )
        );
        toast.success("Feedback acknowledged!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to acknowledge feedback");
        toast.error("Failed to acknowledge feedback");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  const handleBulkAcknowledge = async () => {
    const unacknowledgedSelected = selectedItems.filter((id) => {
      const item = feedback.find((f) => f.id === id);
      return item && !item.acknowledged && user.role === "employee";
    });

    if (unacknowledgedSelected.length === 0) {
      toast.error("No unacknowledged feedback selected");
      return;
    }

    try {
      const promises = unacknowledgedSelected.map((id) =>
        fetch(getApiUrl(`/api/feedback/${id}/acknowledge`), {
          method: "POST",
          headers: { "X-User-ID": user.id.toString() },
        })
      );

      await Promise.all(promises);

      setFeedback((prev) =>
        prev.map((item) =>
          unacknowledgedSelected.includes(item.id)
            ? { ...item, acknowledged: true }
            : item
        )
      );

      setSelectedItems([]);
      toast.success(
        `${unacknowledgedSelected.length} feedback items acknowledged!`
      );
    } catch (err) {
      toast.error("Failed to acknowledge feedback items");
    }
  };

  const handleExportPDF = async (feedbackId, employeeName, createdAt) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/feedback/${feedbackId}/export-pdf`),
        {
          headers: {
            "X-User-ID": user.id.toString(),
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `feedback_${employeeName.replace(" ", "_")}_${
          new Date(createdAt).toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("PDF exported successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to export PDF");
        toast.error("Failed to export PDF");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  const openComments = (feedbackId) => {
    setSelectedFeedbackId(feedbackId);
    setShowComments(true);
  };

  const closeComments = () => {
    setShowComments(false);
    setSelectedFeedbackId(null);
  };

  const toggleCardExpansion = (feedbackId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(feedbackId)) {
      newExpanded.delete(feedbackId);
    } else {
      newExpanded.add(feedbackId);
    }
    setExpandedCards(newExpanded);
  };

  const handleSelectItem = (feedbackId) => {
    setSelectedItems((prev) =>
      prev.includes(feedbackId)
        ? prev.filter((id) => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredFeedback.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFeedback.map((item) => item.id));
    }
  };

  // Advanced filtering and sorting logic
  const filteredFeedback = useMemo(() => {
    let filtered = [...feedback];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.strengths?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.areas_to_improve
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.role === "manager" ? item.employee_name : item.manager_name)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sentiment filter
    if (filters.sentiment !== "all") {
      filtered = filtered.filter(
        (item) => item.sentiment === filters.sentiment
      );
    }

    // Acknowledged filter
    if (filters.acknowledged !== "all") {
      const isAcknowledged = filters.acknowledged === "acknowledged";
      filtered = filtered.filter(
        (item) => item.acknowledged === isAcknowledged
      );
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          // "all" case - no filtering needed
          break;
      }

      filtered = filtered.filter(
        (item) => new Date(item.created_at) >= filterDate
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((item) =>
        item.tags?.some((tag) => filters.tags.includes(tag))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "date_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "sentiment":
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 };
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment];
        case "name":
          const nameA =
            user.role === "manager" ? a.employee_name : a.manager_name;
          const nameB =
            user.role === "manager" ? b.employee_name : b.manager_name;
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [feedback, searchTerm, filters, sortBy, user.role]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "success";
      case "neutral":
        return "warning";
      case "negative":
        return "danger";
      default:
        return "neutral";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircleIcon className="w-4 h-4 text-success-600" />;
      case "negative":
        return <ExclamationTriangleIcon className="w-4 h-4 text-danger-600" />;
      case "neutral":
        return <ClockIcon className="w-4 h-4 text-warning-600" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-neutral-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Get unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set();
    feedback.forEach((item) => {
      item.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [feedback]);

  const stats = useMemo(() => {
    const total = feedback.length;
    const acknowledged = feedback.filter((f) => f.acknowledged).length;
    const sentimentCounts = feedback.reduce((acc, f) => {
      acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      acknowledged,
      unacknowledged: total - acknowledged,
      sentimentCounts,
    };
  }, [feedback]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-brand-600" />
              {user.role === "manager"
                ? "Feedback Management"
                : "My Performance Reviews"}
            </h1>
            <p className="text-gray-600">
              {user.role === "manager"
                ? "Feedback you've provided to your team members"
                : "Feedback you've received from your manager"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-0">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Acknowledged
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {stats.acknowledged}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {stats.unacknowledged}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <StarIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Positive</p>
                  <p className="text-xl font-bold text-purple-600">
                    {stats.sentimentCounts.positive || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback content, names, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
            {Object.values(filters).some(
              (f) => f !== "all" && (Array.isArray(f) ? f.length > 0 : true)
            ) && (
              <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {[
              { mode: "card", label: "Cards" },
              { mode: "list", label: "List" },
              { mode: "detailed", label: "Detailed" },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-primary-500 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sentiment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sentiment
                  </label>
                  <select
                    value={filters.sentiment}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sentiment: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Sentiments</option>
                    <option value="positive">✓ Positive</option>
                    <option value="neutral">– Neutral</option>
                    <option value="negative">⚠ Needs Attention</option>
                  </select>
                </div>

                {/* Acknowledgment Filter */}
                {user.role === "employee" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.acknowledged}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          acknowledged: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Status</option>
                      <option value="acknowledged">✓ Acknowledged</option>
                      <option value="pending">⏳ Pending Review</option>
                    </select>
                  </div>
                )}

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="sentiment">By Sentiment</option>
                    <option value="name">By Name</option>
                  </select>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter((t) => t !== tag)
                            : [...filters.tags, tag];
                          setFilters((prev) => ({ ...prev, tags: newTags }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                          filters.tags.includes(tag)
                            ? "bg-primary-100 text-primary-800 border-primary-300"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIconSolid className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-primary-800 font-medium">
                  {selectedItems.length} item
                  {selectedItems.length > 1 ? "s" : ""} selected
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {user.role === "employee" && (
                  <button
                    onClick={handleBulkAcknowledge}
                    className="btn-primary btn-sm"
                  >
                    Acknowledge Selected
                  </button>
                )}

                <button
                  onClick={() => setSelectedItems([])}
                  className="btn-secondary btn-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select All Checkbox */}
      {filteredFeedback.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredFeedback.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              Select all ({filteredFeedback.length} items)
            </span>
          </label>

          <div className="text-sm text-gray-500">
            Showing {filteredFeedback.length} of {feedback.length} feedback
            items
          </div>
        </div>
      )}

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ||
            Object.values(filters).some(
              (f) => f !== "all" && (Array.isArray(f) ? f.length > 0 : true)
            )
              ? "No feedback matches your criteria"
              : "No feedback yet"}
          </h3>
          <p className="text-gray-500">
            {searchTerm ||
            Object.values(filters).some(
              (f) => f !== "all" && (Array.isArray(f) ? f.length > 0 : true)
            )
              ? "Try adjusting your search or filters"
              : user.role === "manager"
              ? "Start giving feedback to your team members."
              : "You haven't received any feedback yet."}
          </p>
        </motion.div>
      ) : (
        <div className={`space-y-4 ${viewMode === "list" ? "space-y-2" : ""}`}>
          <AnimatePresence>
            {filteredFeedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${
                  selectedItems.includes(item.id)
                    ? "ring-2 ring-primary-500 border-primary-300"
                    : ""
                }`}
              >
                {viewMode === "card" && (
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.role === "manager"
                                ? `Feedback for ${item.employee_name}`
                                : `Feedback from ${item.manager_name}`}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                                item.sentiment
                              )}`}
                            >
                              {getSentimentIcon(item.sentiment)}
                            </span>

                            {user.role === "employee" && !item.acknowledged && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                New
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{formatDate(item.created_at)}</span>
                            <span className="mx-2">•</span>
                            <span>{getRelativeTime(item.created_at)}</span>
                          </div>

                          {/* Content Preview */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                💪 Strengths
                              </h4>
                              <p
                                className={`text-sm text-gray-600 ${
                                  expandedCards.has(item.id)
                                    ? ""
                                    : "line-clamp-2"
                                }`}
                              >
                                {item.strengths}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                🎯 Areas to Improve
                              </h4>
                              <p
                                className={`text-sm text-gray-600 ${
                                  expandedCards.has(item.id)
                                    ? ""
                                    : "line-clamp-2"
                                }`}
                              >
                                {item.areas_to_improve}
                              </p>
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  🏷️ Tags
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => toggleCardExpansion(item.id)}
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700 mt-3"
                          >
                            {expandedCards.has(item.id) ? (
                              <>
                                <ChevronUpIcon className="w-4 h-4 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="w-4 h-4 mr-1" />
                                Show More
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openComments(item.id)}
                          className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                          Comments
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleExportPDF(
                              item.id,
                              user.role === "manager"
                                ? item.employee_name
                                : item.manager_name,
                              item.created_at
                            )
                          }
                          className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                          Export PDF
                        </motion.button>
                      </div>

                      {user.role === "employee" && !item.acknowledged && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcknowledge(item.id)}
                          className="btn-primary btn-sm"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Acknowledge
                        </motion.button>
                      )}

                      {user.role === "employee" && item.acknowledged && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircleIconSolid className="w-4 h-4 mr-1" />
                          Acknowledged
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === "list" && (
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">
                                {user.role === "manager"
                                  ? item.employee_name
                                  : item.manager_name}
                              </h3>

                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                                  item.sentiment
                                )}`}
                              >
                                {getSentimentIcon(item.sentiment)}
                              </span>

                              {user.role === "employee" &&
                                !item.acknowledged && (
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{getRelativeTime(item.created_at)}</span>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => openComments(item.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <ChatBubbleLeftIcon className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    handleExportPDF(
                                      item.id,
                                      user.role === "manager"
                                        ? item.employee_name
                                        : item.manager_name,
                                      item.created_at
                                    )
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <ArrowDownTrayIcon className="w-4 h-4" />
                                </button>

                                {user.role === "employee" &&
                                  !item.acknowledged && (
                                    <button
                                      onClick={() => handleAcknowledge(item.id)}
                                      className="p-1 hover:bg-gray-100 rounded text-green-600"
                                    >
                                      <CheckCircleIcon className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "detailed" && (
                  <div className="p-6">
                    {/* Similar to card but with full content always visible */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {user.role === "manager"
                                ? `Feedback for ${item.employee_name}`
                                : `Feedback from ${item.manager_name}`}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                                item.sentiment
                              )}`}
                            >
                              {getSentimentIcon(item.sentiment)}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{formatDate(item.created_at)}</span>
                            <span className="mx-2">•</span>
                            <span>{getRelativeTime(item.created_at)}</span>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-medium text-green-800 mb-2">
                                💪 Strengths
                              </h4>
                              <p className="text-green-700 whitespace-pre-wrap">
                                {item.strengths}
                              </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-medium text-blue-800 mb-2">
                                🎯 Areas to Improve
                              </h4>
                              <p className="text-blue-700 whitespace-pre-wrap">
                                {item.areas_to_improve}
                              </p>
                            </div>

                            {item.tags && item.tags.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">
                                  🏷️ Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openComments(item.id)}
                          className="btn-secondary btn-sm"
                        >
                          <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                          View Comments
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleExportPDF(
                              item.id,
                              user.role === "manager"
                                ? item.employee_name
                                : item.manager_name,
                              item.created_at
                            )
                          }
                          className="btn-secondary btn-sm"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                          Export PDF
                        </motion.button>
                      </div>

                      {user.role === "employee" && !item.acknowledged && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcknowledge(item.id)}
                          className="btn-primary"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Acknowledge Feedback
                        </motion.button>
                      )}

                      {user.role === "employee" && item.acknowledged && (
                        <div className="flex items-center text-green-600 font-medium">
                          <CheckCircleIconSolid className="w-5 h-5 mr-2" />
                          Acknowledged
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeComments}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <FeedbackComments
                feedbackId={selectedFeedbackId}
                onClose={closeComments}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackList;
