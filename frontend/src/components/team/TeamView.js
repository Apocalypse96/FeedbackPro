import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const TeamView = () => {
  const { isManager, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isManager) {
      navigate("/dashboard");
      return;
    }

    if (isAuthenticated) {
      fetchTeamData();
    } else {
      navigate("/login");
    }
  }, [isManager, isAuthenticated, navigate]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamResponse, feedbackResponse] = await Promise.all([
        axios.get("/api/users/team"),
        axios.get("/api/feedback/"),
      ]);

      setTeamMembers(teamResponse.data.team_members);
      setFeedback(feedbackResponse.data.feedback);
    } catch (error) {
      console.error("Failed to fetch team data:", error);
      setError("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const getTeamMemberFeedback = (memberId) => {
    return feedback.filter((f) => f.employee_id === memberId);
  };

  const getLatestFeedback = (memberId) => {
    const memberFeedback = getTeamMemberFeedback(memberId);
    return memberFeedback.length > 0
      ? memberFeedback[memberFeedback.length - 1]
      : null;
  };

  const getFeedbackStats = (memberId) => {
    const memberFeedback = getTeamMemberFeedback(memberId);
    const total = memberFeedback.length;
    const acknowledged = memberFeedback.filter((f) => f.acknowledged).length;

    const sentimentCounts = memberFeedback.reduce((acc, f) => {
      acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      acknowledged,
      unacknowledged: total - acknowledged,
      sentimentCounts,
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-success-600 bg-success-50 border-success-200";
      case "neutral":
        return "text-warning-600 bg-warning-50 border-warning-200";
      case "negative":
        return "text-danger-600 bg-danger-50 border-danger-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
        return <CalendarIcon className="w-4 h-4 text-neutral-600" />;
    }
  };

  if (!isManager) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-premium glass-premium">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="page-title flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                Team Management
              </h1>
              <p className="page-subtitle">
                Monitor your team members and track their feedback progress
              </p>
            </div>
            <button
              onClick={() => navigate("/feedback/create")}
              className="btn-primary btn-md whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Create Feedback
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-premium">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-6 h-6 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-600">
                  Team Size
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {teamMembers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-6 h-6 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-600">
                  Total Feedback
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {feedback.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-success-100 to-success-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-success-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-600">
                  Acknowledged
                </p>
                <p className="text-2xl font-bold text-success-600">
                  {feedback.filter((f) => f.acknowledged).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-warning-100 to-warning-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <ClockIcon className="w-6 h-6 text-warning-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-warning-600">
                  {feedback.filter((f) => !f.acknowledged).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card-premium">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-brand-600" />
            Team Members
          </h2>
        </div>
        <div className="card-body">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No team members assigned
              </h3>
              <p className="text-neutral-600 mb-4 max-w-md mx-auto">
                You don't have any team members assigned to you yet. Team
                members will appear here once they register with you as their
                manager.
              </p>
              <p className="text-sm text-neutral-500">
                Share your manager email with team members for them to register
                under your supervision.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {teamMembers.map((member) => {
                const stats = getFeedbackStats(member.id);
                const latestFeedback = getLatestFeedback(member.id);

                return (
                  <div
                    key={member.id}
                    className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 bg-white"
                  >
                    {/* Member Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-neutral-900 truncate">
                            {member.name}
                          </h3>
                          <p className="text-sm text-neutral-500 truncate">
                            {member.email}
                          </p>
                          <p className="text-xs text-neutral-400">
                            Joined: {formatDate(member.created_at)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate("/feedback/create")}
                        className="btn-primary btn-sm flex-shrink-0"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Feedback</span>
                      </button>
                    </div>

                    {/* Feedback Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-neutral-900">
                          {stats.total}
                        </p>
                        <p className="text-xs text-neutral-500">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-600">
                          {stats.acknowledged}
                        </p>
                        <p className="text-xs text-neutral-500">Reviewed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-warning-600">
                          {stats.unacknowledged}
                        </p>
                        <p className="text-xs text-neutral-500">Pending</p>
                      </div>
                    </div>

                    {/* Sentiment Distribution */}
                    {stats.total > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                          Performance Overview
                        </p>
                        <div className="flex space-x-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          {["positive", "neutral", "negative"].map(
                            (sentiment) => {
                              const count =
                                stats.sentimentCounts[sentiment] || 0;
                              const percentage =
                                stats.total > 0
                                  ? (count / stats.total) * 100
                                  : 0;

                              return (
                                <div
                                  key={sentiment}
                                  className={`h-full transition-all ${
                                    sentiment === "positive"
                                      ? "bg-success-500"
                                      : sentiment === "neutral"
                                      ? "bg-warning-500"
                                      : "bg-danger-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                  title={`${sentiment}: ${count} (${percentage.toFixed(
                                    0
                                  )}%)`}
                                />
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Latest Feedback */}
                    {latestFeedback ? (
                      <div className="border-t border-neutral-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-neutral-700">
                            Recent Feedback
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getSentimentColor(
                              latestFeedback.sentiment
                            )}`}
                          >
                            {getSentimentIcon(latestFeedback.sentiment)}
                            <span className="capitalize">
                              {latestFeedback.sentiment}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                          <span className="font-medium">Strengths:</span>{" "}
                          {latestFeedback.strengths}
                        </p>
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span>{formatDate(latestFeedback.created_at)}</span>
                          {latestFeedback.acknowledged && (
                            <span className="flex items-center gap-1 text-success-600">
                              <CheckCircleIcon className="w-3 h-3" />
                              Acknowledged
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-neutral-200 pt-4">
                        <p className="text-sm text-neutral-500 italic text-center">
                          No feedback provided yet
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamView;
