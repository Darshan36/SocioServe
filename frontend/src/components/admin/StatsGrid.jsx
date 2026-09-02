// src/components/admin/StatsGrid.jsx
import React from "react";
import { FaMoneyBillWave, FaUserTie, FaClock, FaBan } from "react-icons/fa";

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-800 mt-2">{count}</h3>
        {subtext && <p className="text-gray-400 text-xs mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export default function StatsGrid({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Revenue"
        count={`₹${stats.revenue?.toLocaleString() || 0}`}
        icon={FaMoneyBillWave}
        color="bg-green-500"
        subtext="Lifetime Earnings"
      />
      <StatCard
        title="Active Maids"
        count={stats.maids?.active || 0}
        icon={FaUserTie}
        color="bg-indigo-500"
        subtext={`${stats.maids?.total || 0} Total Registered`}
      />
      <StatCard
        title="Pending Approvals"
        count={stats.maids?.pending || 0}
        icon={FaClock}
        color="bg-yellow-500"
        subtext={stats.maids?.pending > 0 ? "Action Needed" : "All Clear"}
      />
      <StatCard
        title="Banned / Strikes"
        count={stats.maids?.banned || 0}
        icon={FaBan}
        color="bg-red-500"
        subtext="Restricted Access"
      />
    </div>
  );
}