import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const Layout = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: ChartBarIcon,
      description: "Overview and analytics",
    },
    {
      name: "Feedback",
      href: "/feedback",
      icon: ChatBubbleLeftRightIcon,
      description: "View feedback history",
    },
    {
      name: "Feedback Requests",
      href: "/feedback-requests",
      icon: DocumentTextIcon,
      description: "Pending feedback items",
    },
    ...(user?.role === "manager"
      ? [
          {
            name: "Create Feedback",
            href: "/feedback/create",
            icon: PencilSquareIcon,
            description: "Submit new feedback",
          },
          {
            name: "Team",
            href: "/team",
            icon: UsersIcon,
            description: "Manage your team",
          },
        ]
      : []),
  ];

  const isActiveRoute = (href) => location.pathname === href;

  return (
    <div className="min-h-screen content-bg-primary">
      {/* Navigation Header */}
      <nav className="glass-premium shadow-floating border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-glow hover-float">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold gradient-text">FeedbackPro</h1>
              </motion.div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:ml-10 md:flex md:space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);

                  return (
                    <motion.button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${
                        isActive
                          ? "nav-link-active glass-premium"
                          : "nav-link-inactive hover:glass-premium"
                      } relative hover-lift`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-brand-50/90 to-brand-100/80 border border-brand-200/60 rounded-xl -z-10 shadow-soft"
                          initial={false}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors relative glass-premium rounded-lg hover-float"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse shadow-glow"></span>
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-neutral-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-glow hover-float">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-ghost btn-sm hidden sm:flex glass-premium hover-lift"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 text-neutral-400 hover:text-neutral-600 transition-colors glass-premium rounded-lg hover-float"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/30 glass-premium backdrop-blur-2xl"
            >
              <div className="px-4 py-2 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);

                  return (
                    <motion.button
                      key={item.href}
                      onClick={() => {
                        navigate(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`${
                        isActive
                          ? "bg-gradient-to-r from-brand-50/90 to-brand-100/80 text-brand-700 border-brand-200/60"
                          : "text-neutral-600 hover:bg-white/60"
                      } w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all border glass-premium hover-lift`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <div>{item.name}</div>
                        <div className="text-xs text-neutral-500">
                          {item.description}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Mobile Logout */}
                <motion.button
                  onClick={handleLogout}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all text-danger-600 hover:bg-danger-50/80 glass-premium border border-danger-200/60 hover-lift"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="page-section relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
