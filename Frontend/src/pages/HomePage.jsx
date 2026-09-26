import React from "react";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-purple-400">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-purple-700 text-center drop-shadow">
          📢 Student Gymkhana presents: Treasure Hunt 🧠✨
        </h1>
        <p className="mb-4 text-lg text-indigo-800 text-center">
          As part of Freshers 2026, get ready for an exciting, multi-round
          challenge that blends fun with data-driven problem-solving!
        </p>
        <ul className="mb-6 space-y-2 text-base text-blue-900">
          <li>
            📅 <b>Date:</b> 26th September 2026
          </li>
          <li>
            🕠 <b>Time:</b> 5:30 PM onwards
          </li>
          <li>
            📍 <b>Venue:</b> Student Hub
          </li>
          <li>
            👥 <b>Team Size:</b> Only 3 members
          </li>
          <li>
            💰 <b>Prize Pool:</b> Prize to be announced
          </li>
          <li>
            📲 <b>Registration:</b> Only team leads need to register via the Google Forms.
          </li>
        </ul>
        <div className="mb-6">
          <span className="block font-semibold text-purple-700 mb-2">
            🔗 For event updates & general communication:
          </span>
          <a
            href="https://chat.whatsapp.com/BiSmYpMlixfFv5GEZCrz8t?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline break-all font-semibold"
          >
            Join the WhatsApp Group
          </a>
        </div>
        <div className="mb-6 text-center text-indigo-800 font-semibold">
          Think logically, act fast, and hunt the data clues to victory! 🔍🔥
        </div>
        <div className="text-right text-purple-700 font-semibold">
          <br />
          <span className="text-blue-700">
            Student Gymkhana
          </span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
