import React from "react";
import Button from "./Button";

function AdminNavbar({ onLogout }) {
  return (
    <nav className="w-full bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-4">
        <span className="font-bold text-xl tracking-wide">Admin Panel</span>
        <a href="/admin" className="hover:underline">
          Dashboard
        </a>
        <a href="/admin?tab=view" className="hover:underline">
          Teams
        </a>
        <a href="/admin?tab=create" className="hover:underline">
          Create Team
        </a>
        <a href="/admin?tab=leaderboard" className="hover:underline">
          Leaderboard
        </a>
      </div>
      {onLogout && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="text-white border-white hover:bg-blue-800"
        >
          Logout
        </Button>
      )}
    </nav>
  );
}

export default AdminNavbar;
