import React from "react";
import { FaHome, FaSearch, FaCalendarAlt, FaSignOutAlt,FaWallet } from "react-icons/fa";

export default function UserSidebar({ activeTab, setActiveTab, handleLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-yellow-700 flex items-center gap-2">SocioServe</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'dashboard' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FaHome size={18} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("search")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'search' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FaSearch size={18} /> Find Help
        </button>
        <button 
          onClick={() => setActiveTab("bookings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'bookings' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FaCalendarAlt size={18} /> My Bookings
        </button>

        <button 
  onClick={() => setActiveTab("transactions")}
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'transactions' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
>
  <FaWallet size={18} />
  Transaction History
</button>
      </nav>

      <div className="p-4 border-t">
        <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-medium px-4 py-2 hover:bg-red-50 rounded-lg w-full transition">
          <FaSignOutAlt size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}