import React from "react";

function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 focus:outline-none ${
            activeTab === tab.value
              ? "border-blue-600 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => onTabChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
