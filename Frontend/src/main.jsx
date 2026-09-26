import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Import AuthProvider
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Import all your pages
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LeaderboardsPage from "./pages/LeaderboardsPage.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import TreasureHuntPage from "./pages/TreasureHuntPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="instructions" element={<InstructionsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="leaderboards" element={<LeaderboardsPage />} />
            {/* Protected routes - require authentication */}
            <Route
              path="scan-qr"
              element={
                <ProtectedRoute>
                  <TreasureHuntPage />
                </ProtectedRoute>
              }
            />
            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* Admin dashboard is rendered outside App to avoid global Navbar */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
