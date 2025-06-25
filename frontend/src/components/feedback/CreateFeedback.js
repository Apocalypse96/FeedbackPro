import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  StarIcon,
  LightBulbIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import axios from "axios";
import toast from "react-hot-toast";

const CreateFeedback = () => {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const autoSaveTimer = useRef(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    strengths: "",
    areas_to_improve: "",
    sentiment: "positive",
    tags: [],
    priority: "medium",
    goals: "",
    action_items: [],
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaved, setAutoSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Enhanced tags with categories and colors
  const availableTags = {
    skills: [
      { name: "technical-skills", label: "Technical Skills", color: "blue" },
      { name: "communication", label: "Communication", color: "green" },
      { name: "leadership", label: "Leadership", color: "purple" },
      { name: "problem-solving", label: "Problem Solving", color: "orange" },
      { name: "creativity", label: "Creativity", color: "pink" },
      {
        name: "analytical-thinking",
        label: "Analytical Thinking",
        color: "indigo",
      },
    ],
    behavior: [
      { name: "teamwork", label: "Teamwork", color: "emerald" },
      { name: "initiative", label: "Initiative", color: "yellow" },
      { name: "adaptability", label: "Adaptability", color: "teal" },
      { name: "time-management", label: "Time Management", color: "red" },
      {
        name: "attention-to-detail",
        label: "Attention to Detail",
        color: "gray",
      },
      { name: "mentoring", label: "Mentoring", color: "violet" },
    ],
    performance: [
      {
        name: "exceeds-expectations",
        label: "Exceeds Expectations",
        color: "emerald",
      },
      {
        name: "meets-expectations",
        label: "Meets Expectations",
        color: "blue",
      },
      {
        name: "needs-improvement",
        label: "Needs Improvement",
        color: "orange",
      },
      { name: "customer-focused", label: "Customer Focused", color: "green" },
    ],
  };

  const steps = [
    { id: 1, name: "Employee", icon: UserIcon },
    { id: 2, name: "Feedback", icon: DocumentTextIcon },
    { id: 3, name: "Details", icon: StarIcon },
    { id: 4, name: "Review", icon: CheckCircleIcon },
  ];

  useEffect(() => {
    if (!isManager) {
      navigate("/dashboard");
      return;
    }
    fetchTeamMembers();
  }, [isManager, navigate]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (
      !formData.employee_id ||
      (!formData.strengths && !formData.areas_to_improve)
    )
      return;

    try {
      const draftData = {
        ...formData,
        isDraft: true,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(
        `feedback_draft_${formData.employee_id}`,
        JSON.stringify(draftData)
      );
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [formData]);

  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(autoSave, 3000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave]);

  // Load draft on employee selection
  useEffect(() => {
    if (formData.employee_id) {
      const draft = localStorage.getItem(
        `feedback_draft_${formData.employee_id}`
      );
      if (draft) {
        const draftData = JSON.parse(draft);
        if (
          window.confirm(
            "Found a saved draft for this employee. Would you like to continue where you left off?"
          )
        ) {
          setFormData((prev) => ({ ...prev, ...draftData, isDraft: false }));
          toast.success("Draft loaded successfully!");
        }
      }

      const employee = teamMembers.find(
        (m) => m.id.toString() === formData.employee_id
      );
      setSelectedEmployee(employee);
    }
  }, [formData.employee_id, teamMembers]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get("/api/users/team");
      setTeamMembers(response.data.team_members);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      setError("Failed to load team members");
      toast.error("Failed to load team members");
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.employee_id)
          errors.employee_id = "Please select a team member";
        break;
      case 2:
        if (!formData.strengths.trim())
          errors.strengths = "Please provide strengths";
        if (!formData.areas_to_improve.trim())
          errors.areas_to_improve = "Please provide areas to improve";
        if (formData.strengths.length < 20)
          errors.strengths =
            "Please provide more detailed feedback (minimum 20 characters)";
        if (formData.areas_to_improve.length < 20)
          errors.areas_to_improve =
            "Please provide more detailed feedback (minimum 20 characters)";
        break;
      case 3:
        // Optional validations for details step
        break;
      case 4:
        // Final review step - no additional validation needed
        break;
      default:
        break;
    }

    return errors;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    setError("");
    setSuccess(false);
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.some((t) => t.name === tag.name)
        ? prev.tags.filter((t) => t.name !== tag.name)
        : [...prev.tags, tag],
    }));
  };

  const addActionItem = () => {
    setFormData((prev) => ({
      ...prev,
      action_items: [
        ...prev.action_items,
        { text: "", completed: false, id: Date.now() },
      ],
    }));
  };

  const updateActionItem = (id, text) => {
    setFormData((prev) => ({
      ...prev,
      action_items: prev.action_items.map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    }));
  };

  const removeActionItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      action_items: prev.action_items.filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/feedback/", {
        employee_id: formData.employee_id,
        strengths: formData.strengths,
        areas_to_improve: formData.areas_to_improve,
        sentiment: formData.sentiment,
        tags: formData.tags,
        priority: formData.priority,
        goals: formData.goals,
        action_items: formData.action_items,
      });

      // Clear draft after successful submission
      localStorage.removeItem(`feedback_draft_${formData.employee_id}`);

      setSuccess(true);
      toast.success("Feedback submitted successfully!");

      setTimeout(() => {
        navigate("/feedback");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit feedback";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentDescription = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "Employee is performing excellently and exceeding expectations";
      case "neutral":
        return "Employee is meeting expectations with opportunities for growth";
      case "negative":
        return "Employee needs focused support and improvement in key areas";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCharacterCount = (text, max = 500) => {
    const remaining = max - text.length;
    const percentage = (text.length / max) * 100;

    return {
      count: text.length,
      remaining,
      percentage,
      isOverLimit: text.length > max,
      colorClass:
        percentage > 90
          ? "text-red-500"
          : percentage > 75
          ? "text-yellow-500"
          : "text-gray-500",
    };
  };

  if (!isManager) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                ✍️ Create New Feedback
              </h1>
              <p className="text-gray-600">
                Provide structured feedback to help your team members grow
              </p>
            </div>
            <AnimatePresence>
              {autoSaved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full"
                >
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Auto-saved
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
          <nav aria-label="Progress" className="max-w-4xl mx-auto">
            <ol className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.name}
                  className="relative flex-1 flex items-center justify-center min-w-0 px-2"
                >
                  <div className="flex flex-col items-center space-y-2 relative">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 transform hover:scale-105 z-10 ${
                        step.id < currentStep
                          ? "bg-primary-600 border-primary-600 text-white shadow-glow"
                          : step.id === currentStep
                          ? "border-primary-600 bg-white text-primary-600 shadow-medium"
                          : "border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:shadow-soft"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircleSolid className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </button>
                    <span
                      className={`text-xs sm:text-sm font-medium text-center whitespace-nowrap transition-colors duration-300 px-1 ${
                        step.id <= currentStep
                          ? "text-primary-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 z-0 hidden sm:block">
                      <div
                        className={`h-full transition-all duration-500 ${
                          step.id < currentStep
                            ? "bg-gradient-to-r from-primary-600 to-primary-500"
                            : "bg-gray-300"
                        }`}
                        style={{
                          marginLeft: "2.5rem",
                          width: "calc(100% - 5rem)",
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>

            {/* Mobile Progress Bar */}
            <div className="mt-4 sm:hidden">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>
                  Step {currentStep} of {steps.length}
                </span>
                <span>
                  {Math.round((currentStep / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </nav>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-success-50 border border-success-200 text-success-700 px-6 py-4 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircleSolid className="w-6 h-6 mr-3 text-success-500" />
              <div>
                <p className="font-medium">Feedback submitted successfully!</p>
                <p className="text-sm mt-1">Redirecting to feedback list...</p>
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
            className="bg-danger-50 border border-danger-200 text-danger-700 px-6 py-4 rounded-lg"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 mr-3 text-danger-500" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Employee Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="employee_id"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    👤 Select Team Member *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {teamMembers.map((member) => (
                      <motion.label
                        key={member.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.employee_id === member.id.toString()
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="employee_id"
                          value={member.id}
                          checked={
                            formData.employee_id === member.id.toString()
                          }
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              formData.employee_id === member.id.toString()
                                ? "bg-primary-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {formData.employee_id === member.id.toString() && (
                          <CheckCircleSolid className="w-6 h-6 text-primary-500" />
                        )}
                      </motion.label>
                    ))}
                  </div>
                  {validationErrors.employee_id && (
                    <p className="text-sm text-red-500 mt-2">
                      {validationErrors.employee_id}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Main Feedback */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {selectedEmployee && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedEmployee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          Feedback for {selectedEmployee.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedEmployee.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths */}
                <div>
                  <label htmlFor="strengths" className="label">
                    Key Strengths <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="strengths"
                      name="strengths"
                      value={formData.strengths}
                      onChange={handleChange}
                      rows={4}
                      className={`input-field pr-16 ${
                        validationErrors.strengths
                          ? "border-red-300 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Highlight what this team member does well. Be specific about their achievements, skills, and positive contributions..."
                    />
                    <div
                      className={`absolute bottom-2 right-2 text-xs ${
                        getCharacterCount(formData.strengths).colorClass
                      }`}
                    >
                      {getCharacterCount(formData.strengths).count}/500
                    </div>
                  </div>
                  {validationErrors.strengths && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.strengths}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Focus on specific examples and achievements to make the
                    feedback actionable.
                  </p>
                </div>

                {/* Areas to Improve */}
                <div>
                  <label htmlFor="improvements" className="label">
                    Development Areas <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="areas_to_improve"
                      name="areas_to_improve"
                      value={formData.areas_to_improve}
                      onChange={handleChange}
                      rows={4}
                      className={`input-field pr-16 ${
                        validationErrors.areas_to_improve
                          ? "border-red-300 focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Provide constructive suggestions for growth and development. Focus on specific behaviors or skills that can be improved..."
                    />
                    <div
                      className={`absolute bottom-2 right-2 text-xs ${
                        getCharacterCount(formData.areas_to_improve).colorClass
                      }`}
                    >
                      {getCharacterCount(formData.areas_to_improve).count}/500
                    </div>
                  </div>
                  {validationErrors.areas_to_improve && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.areas_to_improve}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Frame suggestions positively and provide actionable steps
                    for improvement.
                  </p>
                </div>

                {/* Sentiment */}
                <div>
                  <label
                    htmlFor="sentiment"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    😊 Overall Sentiment *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "positive",
                        emoji: "😊",
                        label: "Positive",
                        color: "green",
                      },
                      {
                        value: "neutral",
                        emoji: "",
                        label: "Neutral",
                        color: "warning",
                      },
                      {
                        value: "negative",
                        emoji: "😞",
                        label: "Negative",
                        color: "red",
                      },
                    ].map((sentiment) => (
                      <motion.label
                        key={sentiment.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.sentiment === sentiment.value
                            ? `border-${sentiment.color}-500 bg-${sentiment.color}-50`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="sentiment"
                          value={sentiment.value}
                          checked={formData.sentiment === sentiment.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-3xl mb-2">{sentiment.emoji}</span>
                        <span className="font-medium text-gray-900">
                          {sentiment.label}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {getSentimentDescription(formData.sentiment)}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    🔥 Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "high",
                        label: "High",
                        description: "Needs immediate attention",
                      },
                      {
                        value: "medium",
                        label: "Medium",
                        description: "Standard follow-up",
                      },
                      {
                        value: "low",
                        label: "Low",
                        description: "General guidance",
                      },
                    ].map((priority) => (
                      <motion.label
                        key={priority.value}
                        whileHover={{ scale: 1.02 }}
                        className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.priority === priority.value
                            ? getPriorityColor(priority.value)
                                .replace("text-", "border-")
                                .replace("bg-", "bg-")
                                .replace("border-", "border-")
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="font-medium text-gray-900">
                          {priority.label}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {priority.description}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    🏷️ Feedback Tags
                  </label>

                  {Object.entries(availableTags).map(([category, tags]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
                        {category.replace("-", " ")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <motion.button
                            key={tag.name}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                              formData.tags.some((t) => t.name === tag.name)
                                ? `bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-300`
                                : `bg-gray-50 text-gray-700 border-gray-200 hover:bg-${tag.color}-50 hover:border-${tag.color}-200`
                            }`}
                          >
                            {tag.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {formData.tags.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        Selected Tags:
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {formData.tags.map((tag) => tag.label).join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div>
                  <label htmlFor="goals" className="label">
                    Development Goals (Optional)
                  </label>
                  <textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Specific goals for this team member to work towards..."
                  />
                </div>

                {/* Action Items */}
                <div>
                  <label htmlFor="actionItems" className="label">
                    Action Items (Optional)
                  </label>
                  <div className="flex items-center justify-between mb-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addActionItem}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + Add Item
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {formData.action_items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) =>
                            updateActionItem(item.id, e.target.value)
                          }
                          placeholder={`Action item ${index + 1}...`}
                          className="flex-1 input-field"
                        />
                        <button
                          type="button"
                          onClick={() => removeActionItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Review Your Feedback
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">
                        Team Member:
                      </h4>
                      <p className="text-gray-900">{selectedEmployee?.name}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">Strengths:</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {formData.strengths}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">
                        Areas to Improve:
                      </h4>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {formData.areas_to_improve}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Sentiment:
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                            formData.sentiment === "positive"
                              ? "bg-green-100 text-green-800"
                              : formData.sentiment === "neutral"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formData.sentiment === "positive"
                            ? "😊"
                            : formData.sentiment === "neutral"
                            ? "😐"
                            : "😞"}{" "}
                          {formData.sentiment}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700">Priority:</h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${getPriorityColor(
                            formData.priority
                          )}`}
                        >
                          {formData.priority}
                        </span>
                      </div>
                    </div>

                    {formData.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700">Tags:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.tags.map((tag) => (
                            <span
                              key={tag.name}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-${tag.color}-100 text-${tag.color}-800`}
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.goals && (
                      <div>
                        <h4 className="font-medium text-gray-700">Goals:</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {formData.goals}
                        </p>
                      </div>
                    )}

                    {formData.action_items.filter((item) => item.text.trim())
                      .length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Action Items:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {formData.action_items
                            .filter((item) => item.text.trim())
                            .map((item) => (
                              <li key={item.id} className="text-gray-900">
                                {item.text}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevious}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    ← Previous
                  </motion.button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/feedback")}
                  className="btn-ghost w-full sm:w-auto order-2 sm:order-1"
                  disabled={loading}
                >
                  Cancel
                </motion.button>

                {currentStep < 4 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="btn-primary w-full sm:w-auto order-1 sm:order-2"
                  >
                    Next →
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
                    disabled={loading || teamMembers.length === 0}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Feedback"
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start">
          <LightBulbIcon className="w-6 h-6 text-primary-600 mb-3 sm:mt-0.5 sm:mr-3 sm:mb-0 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-primary-900 mb-3">
              💡 Best Practices for Professional Feedback
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-primary-800">
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>
                    Use the STAR method: Situation, Task, Action, Result
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>
                    Balance recognition with constructive development areas
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>
                    Focus on observable behaviors and measurable outcomes
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>Provide specific, actionable recommendations</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>Set clear, achievable development goals</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>
                    Use tags to categorize feedback for better tracking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateFeedback;
