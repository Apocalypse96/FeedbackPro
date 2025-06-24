import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon,
  CalendarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

const Dashboard = () => {
  const { user, isManager, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [feedbackResponse] = await Promise.all([
        axios.get("/api/feedback/"),
      ]);

      const feedback = feedbackResponse.data.feedback;
      setRecentFeedback(feedback.slice(0, 5));

      // Calculate stats
      if (isManager) {
        const totalFeedback = feedback.length;
        const sentimentCounts = feedback.reduce(
          (acc, item) => {
            acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
            return acc;
          },
          { positive: 0, neutral: 0, negative: 0 }
        );

        setStats({
          totalFeedback,
          sentimentCounts,
          acknowledgedCount: feedback.filter((f) => f.acknowledged).length,
        });
      } else {
        const totalReceived = feedback.length;
        const acknowledged = feedback.filter((f) => f.acknowledged).length;
        const pending = totalReceived - acknowledged;

        const sentimentCounts = feedback.reduce(
          (acc, item) => {
            acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
            return acc;
          },
          { positive: 0, neutral: 0, negative: 0 }
        );

        setStats({
          totalReceived,
          acknowledged,
          pending,
          sentimentCounts,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate, fetchDashboardData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircleIconSolid className="w-5 h-5 text-success-600" />;
      case "neutral":
        return <ClockIcon className="w-5 h-5 text-warning-600" />;
      case "negative":
        return <ExclamationTriangleIcon className="w-5 h-5 text-danger-600" />;
      default:
        return <DocumentChartBarIcon className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getSentimentBadgeClass = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "sentiment-positive";
      case "neutral":
        return "sentiment-neutral";
      case "negative":
        return "sentiment-negative";
      default:
        return "badge-neutral";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const managerStats = [
    {
      title: "Total Feedback",
      value: stats.totalFeedback || 0,
      icon: ChatBubbleLeftRightIcon,
      color: "brand",
      description: "Feedback entries created",
      trend: "+12% from last month",
    },
    {
      title: "Acknowledged",
      value: stats.acknowledgedCount || 0,
      icon: CheckCircleIcon,
      color: "success",
      description: "Feedback acknowledged",
      trend: "+8% from last month",
    },
    {
      title: "Positive Feedback",
      value: stats.sentimentCounts?.positive || 0,
      icon: StarIcon,
      color: "success",
      description: "Positive responses",
      trend: "+15% from last month",
    },
    {
      title: "Team Performance",
      value: "95%",
      icon: ShieldCheckIcon,
      color: "brand",
      description: "Overall team score",
      trend: "+5% improvement",
    },
  ];

  const employeeStats = [
    {
      title: "Total Received",
      value: stats.totalReceived || 0,
      icon: ChatBubbleLeftRightIcon,
      color: "brand",
      description: "Feedback received",
      trend: "+3 this month",
    },
    {
      title: "Acknowledged",
      value: stats.acknowledged || 0,
      icon: CheckCircleIcon,
      color: "success",
      description: "Feedback acknowledged",
      trend: `${stats.acknowledged || 0}/${stats.totalReceived || 0}`,
    },
    {
      title: "Pending Review",
      value: stats.pending || 0,
      icon: ClockIcon,
      color: "warning",
      description: "Awaiting acknowledgment",
      trend: stats.pending > 0 ? "Action needed" : "All caught up!",
    },
    {
      title: "Growth Score",
      value: "85%",
      icon: TrendingUpIcon,
      color: "success",
      description: "Development progress",
      trend: "+5% this quarter",
    },
  ];

  const currentStats = isManager ? managerStats : employeeStats;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="page-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            Performance Dashboard
          </h1>
          <p className="page-subtitle">
            {isManager
              ? "Monitor team performance metrics and feedback analytics."
              : "Track your professional development and feedback insights."}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {isManager && (
            <motion.button
              onClick={() => navigate("/feedback/create")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary btn-md"
            >
              <PlusIcon className="w-5 h-5" />
              Create Feedback
            </motion.button>
          )}
          <motion.button
            onClick={() => navigate("/feedback")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary btn-md"
          >
            <EyeIcon className="w-5 h-5" />
            View All Feedback
          </motion.button>
          {isManager && (
            <motion.button
              onClick={() => navigate("/team")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost btn-md"
            >
              <UserGroupIcon className="w-5 h-5" />
              Team Overview
            </motion.button>
          )}
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="alert-danger"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className="card-premium hover-lift"
            >
              <div className="card-body gradient-bg-primary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`stat-icon bg-${stat.color}-100/90 text-${stat.color}-600 shadow-medium hover-glow`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 mb-2">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-500 mb-2">
                      {stat.description}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${stat.color}-50/90 text-${stat.color}-700 shadow-soft hover-glow`}
                    >
                      <ArrowTrendingUpIcon className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="card-premium glass-premium">
            <div className="card-header gradient-bg-success">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <DocumentChartBarIcon className="w-5 h-5 text-brand-600" />
                  Recent Activity
                </h3>
                <motion.button
                  onClick={() => navigate("/feedback")}
                  whileHover={{ scale: 1.05 }}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium glass-premium px-3 py-1 rounded-lg hover-lift flex items-center gap-1"
                >
                  View all
                  <ChevronRightIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="card-body">
              {recentFeedback.length > 0 ? (
                <div className="space-y-4">
                  {recentFeedback.map((feedback, index) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-4 p-4 rounded-xl glass-premium hover:glass-strong transition-all cursor-pointer hover-lift"
                      onClick={() => navigate("/feedback")}
                    >
                      <div className="flex-shrink-0">
                        {getSentimentIcon(feedback.sentiment)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-neutral-900">
                            {isManager
                              ? `Feedback for ${
                                  feedback.employee_name || "Employee"
                                }`
                              : `From ${feedback.manager_name || "Manager"}`}
                          </p>
                          <span
                            className={`${getSentimentBadgeClass(
                              feedback.sentiment
                            )} ml-2 shadow-soft`}
                          >
                            {feedback.sentiment}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                          {feedback.strengths.substring(0, 120)}
                          {feedback.strengths.length > 120 ? "..." : ""}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(feedback.created_at)}
                          </span>
                          {feedback.acknowledged && (
                            <span className="flex items-center gap-1 text-success-600">
                              <CheckCircleIcon className="w-3 h-3" />
                              Acknowledged
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 glass-premium rounded-full flex items-center justify-center mx-auto mb-4 hover-float">
                    <DocumentChartBarIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    No feedback available
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {isManager
                      ? "Start creating feedback entries to track team performance."
                      : "Your feedback history will appear here once it's available."}
                  </p>
                  {isManager && (
                    <motion.button
                      onClick={() => navigate("/feedback/create")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary btn-sm shadow-medium hover-glow"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Create Feedback Entry
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Sentiment Distribution */}
          <div className="card-premium">
            <div className="card-header gradient-bg-purple">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                Performance Metrics
              </h3>
            </div>
            <div className="card-body space-y-4">
              {Object.entries(stats.sentimentCounts || {}).map(
                ([sentiment, count]) => (
                  <div
                    key={sentiment}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getSentimentIcon(sentiment)}
                      <span className="text-sm font-medium text-neutral-700 capitalize">
                        {sentiment}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-neutral-200/60 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className={`h-full rounded-full ${
                            sentiment === "positive"
                              ? "bg-gradient-to-r from-success-500 to-success-400"
                              : sentiment === "neutral"
                              ? "bg-gradient-to-r from-warning-500 to-warning-400"
                              : "bg-gradient-to-r from-danger-500 to-danger-400"
                          }`}
                          style={{
                            width: `${
                              (count /
                                (stats.totalFeedback ||
                                  stats.totalReceived ||
                                  1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card-premium">
            <div className="card-header gradient-bg-warm">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-orange-600" />
                Best Practices
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3 text-sm text-neutral-600">
                {isManager ? (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Provide specific, actionable feedback with clear
                        examples
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Balance constructive criticism with recognition of
                        strengths
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Schedule regular follow-up discussions on progress
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Encourage open dialogue and two-way communication
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Review and acknowledge feedback within 48 hours
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Ask clarifying questions to better understand
                        expectations
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Create specific action plans with measurable goals
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Share progress updates and implementation results
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
