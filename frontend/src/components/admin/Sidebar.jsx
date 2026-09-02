// src/components/admin/Sidebar.jsx
import React from "react";
import { FaThLarge, FaUsers, FaBan, FaFileAlt } from "react-icons/fa";

const SidebarItem = ({ icon: Icon, label, id, activeView, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
      activeView === id
        ? "bg-indigo-50 text-indigo-700 shadow-sm"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default function Sidebar({ activeView, setActiveView }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-2xl tracking-tight">
          <div className="w-8 h-8 bg-indigo-700 text-white rounded-lg flex items-center justify-center text-lg">S</div>
          SocioServe
        </div>
      </div>

      <div className="px-4 space-y-1">
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</div>
        <SidebarItem icon={FaThLarge} label="Dashboard" id="dashboard" activeView={activeView} onClick={setActiveView} />
        <SidebarItem icon={FaUsers} label="Verification" id="requests" activeView={activeView} onClick={setActiveView} />
        <SidebarItem icon={FaBan} label="Banned Users" id="banned" activeView={activeView} onClick={setActiveView} />
        <SidebarItem icon={FaFileAlt} label="Reports" id="reports" activeView={activeView} onClick={setActiveView} />
      </div>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">A</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Society Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}