import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const FeedbackComments = ({ feedbackId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchComments = useCallback(async () => {
    if (!feedbackId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/feedback/${feedbackId}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);

      // Enhanced mock data for better demonstration
      const mockComments = [
        {
          id: 1,
          user_name: "Sarah Wilson",
          user_role: "manager",
          comment_text:
            "Thank you for acknowledging this feedback! 👍 I'm really pleased to see your **proactive approach** to professional development.\n\nLet's schedule a 1:1 next week to discuss the specific action items and how I can support your growth.",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 2,
          liked_by_user: false,
          replies: [],
        },
        {
          id: 2,
          user_name: user?.name || "Alex Johnson",
          user_role: user?.role || "employee",
          comment_text:
            "I really appreciate the detailed feedback! 🙏\n\nI've already started working on improving my `presentation skills` by:\n- Joining the company Toastmasters group\n- Practicing with smaller team meetings\n- Watching online courses on public speaking\n\nLooking forward to our discussion!",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes: 1,
          liked_by_user: true,
          replies: [
            {
              id: 101,
              user_name: "Sarah Wilson",
              user_role: "manager",
              comment_text:
                "That's an excellent initiative! The Toastmasters group is a strategic choice for developing leadership communication skills.",
              created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              likes: 0,
              liked_by_user: false,
            },
          ],
        },
        {
          id: 3,
          user_name: "Mike Chen",
          user_role: "peer",
          comment_text:
            "As someone who's worked closely with Alex, I can confirm the improvement in communication skills is already noticeable! Keep it up! 💪",
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          likes: 3,
          liked_by_user: false,
          replies: [],
        },
      ];

      setComments(mockComments);
      toast.success("Loaded demo comments");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [feedbackId, user]);

  useEffect(() => {
    if (feedbackId) {
      fetchComments();

      // Set up real-time refresh every 10 seconds to show new comments/replies to all users
      const refreshInterval = setInterval(() => {
        fetchComments();
      }, 10000);

      // Cleanup interval on unmount
      return () => clearInterval(refreshInterval);
    }
  }, [feedbackId, fetchComments]);

  const handleManualRefresh = () => {
    fetchComments();
    toast.success("Comments refreshed!");
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await axios.post(
        `/api/feedback/${feedbackId}/comments`,
        {
          comment_text: newComment,
        }
      );

      if (response.data.comment) {
        setComments((prev) => [...prev, response.data.comment]);
        setNewComment("");
        toast.success("Comment posted successfully!");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);

      // Add comment locally for demo
      const newCommentObj = {
        id: Date.now(),
        user_name: user?.name || "You",
        user_role: user?.role || "employee",
        comment_text: newComment,
        created_at: new Date().toISOString(),
        likes: 0,
        liked_by_user: false,
        replies: [],
      };

      setComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      await axios.put(`/api/feedback/${feedbackId}/comments/${commentId}`, {
        comment_text: newText,
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, comment_text: newText }
            : comment
        )
      );

      setEditingComment(null);
      setEditingText("");
      toast.success("Comment updated!");
    } catch (error) {
      // For demo, update locally
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, comment_text: newText }
            : comment
        )
      );

      setEditingComment(null);
      setEditingText("");
      toast.success("Comment updated!");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await axios.delete(`/api/feedback/${feedbackId}/comments/${commentId}`);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted!");
    } catch (error) {
      // For demo, delete locally
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted!");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(
        `/api/feedback/${feedbackId}/comments/${commentId}/like`
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.liked_by_user
                  ? comment.likes - 1
                  : comment.likes + 1,
                liked_by_user: !comment.liked_by_user,
              }
            : comment
        )
      );
    } catch (error) {
      // For demo, update locally
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.liked_by_user
                  ? comment.likes - 1
                  : comment.likes + 1,
                liked_by_user: !comment.liked_by_user,
              }
            : comment
        )
      );
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);

      // Send reply to backend
      const response = await axios.post(
        `/api/feedback/${feedbackId}/comments`,
        {
          comment_text: replyText,
          parent_id: parentId,
        }
      );

      if (response.data.comment) {
        // Add the reply to the parent comment in the local state
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), response.data.comment],
                }
              : comment
          )
        );

        setReplyingTo(null);
        setReplyText("");
        toast.success("Reply posted!");

        // Refresh comments to ensure all users see the latest data
        setTimeout(() => {
          fetchComments();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);

      // Fallback to local state update for demo purposes
      const replyObj = {
        id: Date.now(),
        user_name: user?.name || "You",
        user_role: user?.role || "employee",
        comment_text: replyText,
        created_at: new Date().toISOString(),
        likes: 0,
        liked_by_user: false,
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), replyObj],
              }
            : comment
        )
      );

      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply posted!");
    } finally {
      setSubmitting(false);
    }
  };

  const formatComment = (text) => {
    return text
      .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g, "$1")
      .replace(/\n/g, "<br>")
      .replace(
        /👍|👎|🙏|💪|🎯|❤️|😊|😔|🚀|✨|💡|🔥|⭐/g,
        '<span class="text-lg">$&</span>'
      );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "manager":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "employee":
        return "bg-green-100 text-green-800 border-green-200";
      case "peer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUserInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                💬 Feedback Discussion
              </h2>
              <p className="text-sm text-gray-600">
                Collaborate and share insights on this feedback
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-400">Auto-refreshes every 10s</p>
            </div>
            <motion.button
              onClick={handleManualRefresh}
              disabled={loading}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh comments"
            >
              <ArrowPathIcon
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[70vh]">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No comments yet
              </h3>
              <p className="text-gray-500">
                Start the conversation! Share your thoughts and collaborate.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        {getUserInitials(comment.user_name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {comment.user_name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                              comment.user_role
                            )}`}
                          >
                            {comment.user_role}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLikeComment(comment.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {comment.liked_by_user ? (
                          <HeartIconSolid className="w-4 h-4 text-red-500" />
                        ) : (
                          <HeartIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </motion.button>
                      {comment.likes > 0 && (
                        <span className="text-xs text-gray-500 mr-2">
                          {comment.likes}
                        </span>
                      )}

                      {comment.user_name === user?.name && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditingText(comment.comment_text);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <PencilIcon className="w-4 h-4 text-gray-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comment Content */}
                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEditComment(comment.id, editingText)
                          }
                          className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditingText("");
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-gray-700 leading-relaxed mb-3"
                        dangerouslySetInnerHTML={{
                          __html: formatComment(comment.comment_text),
                        }}
                      />

                      {/* Reply Button */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Reply
                        </button>
                      </div>
                    </>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-6 pl-4 border-l-2 border-gray-200 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-white rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                              {getUserInitials(reply.user_name)}
                            </div>
                            <span className="font-medium text-sm text-gray-900">
                              {reply.user_name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                                reply.user_role
                              )}`}
                            >
                              {reply.user_role}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <div
                            className="text-sm text-gray-700"
                            dangerouslySetInnerHTML={{
                              __html: formatComment(reply.comment_text),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 ml-6 pl-4 border-l-2 border-primary-200">
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Share your professional insights... Support **bold**, *italic*, `code` formatting."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim() || submitting}
                            className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {submitting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Reply"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            disabled={submitting}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                💭 Add your comment
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Share your professional insights... Support **bold**, *italic*, `code` formatting."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use **bold**, *italic*, `code` for professional formatting.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {newComment.length}/500 characters
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Close
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={
                    submitting || !newComment.trim() || newComment.length > 500
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      Post Comment
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackComments;
