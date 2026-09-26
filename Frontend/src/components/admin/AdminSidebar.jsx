import React from "react";

const AdminSidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-56 bg-blue-800 text-white flex flex-col py-8 px-4 min-h-full">
    <div className="font-bold text-lg mb-8">Admin Menu</div>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "event-control" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("event-control")}
    >
      🎮 Event Control
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "view" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("view")}
    >
      View Teams
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "create" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("create")}
    >
      Create Team
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "leaderboard" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("leaderboard")}
    >
      Leaderboard
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "edit" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("edit")}
    >
      Edit Team
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "qr" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("qr")}
    >
      QR Stages
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "qr-gallery" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("qr-gallery")}
    >
      QR Gallery
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "hints" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("hints")}
    >
      Hint Management
    </button>
    <button
      className={`text-left py-2 px-3 rounded mb-2 ${
        activeTab === "rejoin-qr" ? "bg-blue-600" : "hover:bg-blue-700"
      }`}
      onClick={() => setActiveTab("rejoin-qr")}
    >
      🔄 Rejoin QR
    </button>
  </aside>
);

export default AdminSidebar;
