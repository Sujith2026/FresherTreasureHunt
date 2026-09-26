// src/context/AuthContext.jsx
import React, { useState, useContext, useEffect } from "react";
import authService from "../services/authService";
import toast from "react-hot-toast";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentTeam = authService.getCurrentTeam();
        const token = authService.getToken();

        if (currentTeam && token) {
          setTeam(currentTeam);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (teamData) => {
    try {
      setLoading(true);
      const response = await authService.register(teamData);

      // Backend returns { success, message, data: { token, team } }
      if (
        response &&
        response.data &&
        response.data.token &&
        response.data.team
      ) {
        setTeam(response.data.team);
        setIsAuthenticated(true);
        toast.success("Team registered successfully!");
        return { success: true, team: response.data.team };
      }
      // If backend returns { token, team } directly (legacy)
      if (response && response.token && response.team) {
        setTeam(response.team);
        setIsAuthenticated(true);
        toast.success("Team registered successfully!");
        return { success: true, team: response.team };
      }
      // If backend returns { success, message, errors }
      if (response && response.errors) {
        toast.error(response.errors.join(", "));
        return { success: false, error: response.errors.join(", ") };
      }
      toast.error("Registration failed");
      return { success: false, error: "Registration failed" };
    } catch (error) {
      const message = error?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      // Backend returns { success, message, data: { token, team } }
      if (
        response &&
        response.data &&
        response.data.token &&
        response.data.team
      ) {
        setTeam(response.data.team);
        setIsAuthenticated(true);
        toast.success(
          `Welcome back, ${
            response.data.team.teamName || response.data.team.name || "Team"
          }!`
        );
        return { success: true, team: response.data.team };
      }
      // If backend returns { token, team } directly (legacy)
      if (response && response.token && response.team) {
        setTeam(response.team);
        setIsAuthenticated(true);
        toast.success(
          `Welcome back, ${
            response.team.teamName || response.team.name || "Team"
          }!`
        );
        return { success: true, team: response.team };
      }
      // If backend returns { success, message, errors }
      if (response && response.errors) {
        toast.error(response.errors.join(", "));
        return { success: false, error: response.errors.join(", ") };
      }
      toast.error("Login failed");
      return { success: false, error: "Login failed" };
    } catch (error) {
      const message = error?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setTeam(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  const updateTeam = (updatedTeam) => {
    setTeam(updatedTeam);
    localStorage.setItem("team", JSON.stringify(updatedTeam));
  };

  const value = {
    team,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateTeam,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
