import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "employee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError("");
    setValidationErrors({});

    const result = await register(
      formData.email,
      formData.password,
      formData.name,
      formData.role
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const roleOptions = [
    {
      value: "employee",
      label: "Employee",
      description: "Individual contributor with access to personal feedback",
      icon: UserIcon,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      value: "manager",
      label: "Manager",
      description: "Team lead with oversight of direct reports",
      icon: UserGroupIcon,
      gradient: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <ChartBarIcon className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold gradient-text mb-2"
          >
            Join Our Team
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-neutral-600 mb-8"
          >
            Create your account to get started
          </motion.h2>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="card shadow-strong">
          <div className="card-body">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="alert-danger mb-6 flex items-center gap-3"
              >
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`input pl-10 ${
                      validationErrors.name ? "input-error" : ""
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {validationErrors.name && (
                  <p className="form-error">{validationErrors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input pl-10 ${
                      validationErrors.email ? "input-error" : ""
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {validationErrors.email && (
                  <p className="form-error">{validationErrors.email}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label className="label">Role</label>
                <div className="space-y-3">
                  {roleOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.role === option.value
                          ? "border-brand-300 bg-brand-50"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl flex items-center justify-center">
                          <span className="text-lg">{option.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {option.label}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {formData.role === option.value && (
                        <CheckCircleIcon className="w-5 h-5 text-brand-600" />
                      )}
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input pl-10 pr-10 ${
                      validationErrors.password ? "input-error" : ""
                    }`}
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="form-error">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input pl-10 pr-10 ${
                      validationErrors.confirmPassword ? "input-error" : ""
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="form-error">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary btn-lg group"
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center text-sm text-neutral-500"
      >
        Secure • Reliable • Professional
      </motion.div>
    </div>
  );
};

export default Register;
