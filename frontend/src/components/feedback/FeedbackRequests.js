import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../config/api";

const FeedbackRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequestMessage, setNewRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // This would fetch pending feedback requests
      // For now, we'll show some mock data
      const mockRequests = [
        {
          id: 1,
          employee_name: "John Doe",
          manager_name: "Jane Smith",
          requested_date: new Date().toISOString(),
          status: "pending",
          priority: "high",
        },
        {
          id: 2,
          employee_name: "Alice Johnson",
          manager_name: "Bob Wilson",
          requested_date: new Date(Date.now() - 86400000).toISOString(),
          status: "in_progress",
          priority: "medium",
        },
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      setError("Failed to load feedback requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("/api/feedback/requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": user.id.toString(),
        },
        body: JSON.stringify({
          message: newRequestMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequests((prev) => [data.request, ...prev]);
        setNewRequestMessage("");
        setShowRequestForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create request");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/feedback/requests/${requestId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": user.id.toString(),
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests((prev) =>
          prev.map((req) => (req.id === requestId ? data.request : req))
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update request");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.role === "manager"
                ? "Feedback Requests from Team"
                : "My Feedback Requests"}
            </h1>
            <p className="text-gray-600">
              {user.role === "manager"
                ? "Review and respond to feedback requests from your team members"
                : "Request feedback from your manager and track the status"}
            </p>
          </div>
          {user.role === "employee" && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              Request Feedback
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Request Feedback
                </h2>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Optional Message
                  </label>
                  <textarea
                    id="message"
                    value={newRequestMessage}
                    onChange={(e) => setNewRequestMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Let your manager know what specific areas you'd like feedback on..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 1m7-1l1 1m-6 6h6m-3 3v4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No feedback requests
          </h3>
          <p className="text-gray-500">
            {user.role === "manager"
              ? "Your team members haven't requested any feedback yet."
              : 'You haven\'t requested any feedback yet. Click "Request Feedback" to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.role === "manager"
                          ? `Request from ${request.employee_name}`
                          : `Request to ${request.manager_name}`}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      Requested on {formatDate(request.created_at)}
                      {request.completed_at && (
                        <span className="ml-2">
                          • Completed on {formatDate(request.completed_at)}
                        </span>
                      )}
                    </p>

                    {request.message && (
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <p className="text-sm text-gray-700">
                          {request.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {user.role === "manager" && request.status === "pending" && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        handleUpdateRequestStatus(request.id, "declined")
                      }
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateRequestStatus(request.id, "completed")
                      }
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackRequests;
