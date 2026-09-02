// src/components/admin/Header.jsx
import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search candidates..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin-helpdesk")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Helpdesk Tickets
        </button>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
          <FaBell size={18} />
        </button>
      </div>
    </header>
  );
}