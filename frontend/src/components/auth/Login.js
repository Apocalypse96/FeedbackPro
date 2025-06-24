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
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const quickLoginUser = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError("");
  };

  return (
    <div className="min-h-screen content-bg-primary flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-lg blur-lg animate-pulse delay-1000" />

        <div className="relative z-10 p-12 flex flex-col justify-center text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">FeedbackPro</h1>
                <p className="text-brand-200 text-lg">
                  Enterprise Performance Management
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 leading-tight">
              Transform Your Team's
              <br />
              Performance Today
            </h2>

            <p className="text-xl text-brand-100 mb-8 leading-relaxed">
              Streamline feedback processes, boost employee engagement, and
              drive organizational excellence with our enterprise-grade
              platform.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-brand-100">
                  Real-time performance tracking
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-brand-100">
                  Advanced analytics & insights
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-brand-100">
                  Enterprise-grade security
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="card-premium">
            <div className="card-body p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-neutral-600">
                  Sign in to access your performance dashboard
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="alert-danger mb-6"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Quick Login Demo Accounts */}
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-700 mb-3">
                  Demo Accounts:
                </p>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      quickLoginUser("manager1@company.com", "password123")
                    }
                    className="flex items-center gap-3 p-3 text-left border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-brand-300 transition-all duration-200 group"
                    disabled={loading}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-brand-100 to-brand-200 rounded-lg flex items-center justify-center group-hover:from-brand-200 group-hover:to-brand-300 transition-all">
                      <UserIcon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        Team Manager
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        Full team oversight & analytics
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      quickLoginUser("employee1@company.com", "password123")
                    }
                    className="flex items-center gap-3 p-3 text-left border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-brand-300 transition-all duration-200 group"
                    disabled={loading}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-success-100 to-success-200 rounded-lg flex items-center justify-center group-hover:from-success-200 group-hover:to-success-300 transition-all">
                      <UserGroupIcon className="w-4 h-4 text-success-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        Team Member
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        Personal performance dashboard
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">
                    Or sign in manually
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="form-group">
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`input pl-10 ${
                        error && !email.trim() ? "input-error" : ""
                      }`}
                      placeholder="Enter your email"
                      disabled={loading}
                      aria-describedby={
                        error && !email.trim() ? "email-error" : undefined
                      }
                    />
                  </div>
                  {error && !email.trim() && (
                    <p id="email-error" className="form-error">
                      Email is required
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`input pl-10 pr-10 ${
                        error && !password.trim() ? "input-error" : ""
                      }`}
                      placeholder="Enter your password"
                      disabled={loading}
                      aria-describedby={
                        error && !password.trim() ? "password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {error && !password.trim() && (
                    <p id="password-error" className="form-error">
                      Password is required
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary btn-lg w-full"
                  aria-describedby={loading ? "login-status" : undefined}
                >
                  {loading ? (
                    <>
                      <div className="spinner w-5 h-5" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </>
                  )}
                </button>

                {loading && (
                  <p id="login-status" className="sr-only">
                    Signing in, please wait
                  </p>
                )}
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer text-center">
              <p className="text-xs text-neutral-500">
                Enterprise Grade • ISO Compliant • SOC 2 Certified
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
