import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/common/Layout";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import FeedbackList from "./components/feedback/FeedbackList";
import CreateFeedback from "./components/feedback/CreateFeedback";
import TeamView from "./components/team/TeamView";
import FeedbackRequests from "./components/feedback/FeedbackRequests";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="feedback" element={<FeedbackList />} />
              <Route path="feedback/create" element={<CreateFeedback />} />
              <Route path="feedback-requests" element={<FeedbackRequests />} />
              <Route path="team" element={<TeamView />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
