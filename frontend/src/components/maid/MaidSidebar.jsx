import React from "react";
import { FaBriefcase, FaHome, FaClipboardList, FaCalendarCheck, FaWallet, FaClock, FaSignOutAlt, FaTimes } from "react-icons/fa";

export default function MaidSidebar({ activeTab, setActiveTab, logout, pendingCount, isOpen, setIsOpen }) {
  const menuItems = [
    { id: "dashboard", label: "My Profile", icon: FaHome },
    { id: "requests", label: "Job Requests", icon: FaClipboardList, badge: pendingCount },
    { id: "schedule", label: "My Schedule", icon: FaCalendarCheck },
    { id: "transactions", label: "My Earnings", icon: FaWallet },
    { id: "history", label: "History", icon: FaClock },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
            <FaBriefcase /> Partner App
          </h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500"><FaTimes size={20}/></button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === item.id ? "bg-yellow-50 text-yellow-700 shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t mt-auto absolute bottom-0 w-full">
          <button onClick={logout} className="flex items-center gap-3 text-red-500 px-4 py-2 hover:bg-red-50 rounded-lg w-full transition">
            <FaSignOutAlt size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}