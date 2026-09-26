import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Badge from "./Badge";
import Button from "./Button";
import { Menu, X, LogOut, User, Award } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const { team, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    closeSidebar();
  };

  const activeClass = ({ isActive }) =>
    isActive
      ? "bg-blue-100 text-blue-700 px-3 py-2 rounded-md font-medium"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md font-medium";

  const navItems = [
    { to: "/", label: "Home", end: true },
    { to: "/instructions", label: "Instructions" },
    { to: "/leaderboards", label: "Leaderboard" },
  ];

  // Add scan-qr to nav if authenticated
  if (isAuthenticated) {
    navItems.push({ to: "/scan-qr", label: "Scan QR" });
  }

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="shrink-0">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/iiit_logo.png"
                  alt="IIIT Sri City"
                  className="h-10 w-10 rounded-full object-contain shadow-lg"
                />
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 tracking-tight drop-shadow">
                  Treasure Hunt
                </span>
              </Link>
            </div>

            {/* Main Nav Links (hidden on small screens) */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={activeClass}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Profile/Auth section (hidden on small screens) */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <User size={18} className="text-blue-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {team?.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Award size={12} className="text-yellow-600" />
                          {team?.points || 0} points
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 border-red-300"
                    >
                      <LogOut size={16} className="mr-1" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleSidebar}
                aria-label="Open menu"
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeSidebar}
        aria-hidden={!isSidebarOpen}
      />

      {/* Off-canvas sidebar (mobile) */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <div className="text-lg font-semibold text-blue-600">Menu</div>
          <button
            onClick={closeSidebar}
            aria-label="Close menu"
            className="p-2"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base ${
                  isActive
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
              onClick={closeSidebar}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Profile/Auth section */}
          <div className="pt-4 border-t">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-blue-600" />
                    <div className="text-sm font-semibold text-gray-900">
                      {team?.name}
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs">
                    <Award size={10} className="mr-1" />
                    {team?.points || 0} points
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 hover:bg-red-50 border-red-300"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeSidebar}>
                  <Button variant="ghost" size="sm" className="w-full mb-2">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={closeSidebar}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Navbar;
