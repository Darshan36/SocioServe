// src/components/admin/ChartsSection.jsx
import React from "react";
import { FaChartBar, FaExclamationTriangle } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

export default function ChartsSection({ stats, recentDisputes }) {
  const navigate = useNavigate();

  if (!stats) return <p>Loading Charts...</p>;

  const bookingData = [
    { name: "Completed", value: stats.bookings.completed, color: "#10B981" },
    { name: "Cancelled", value: stats.bookings.cancelled, color: "#EF4444" },
    { name: "Disputed", value: stats.bookings.disputed, color: "#F59E0B" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-80">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartBar className="text-indigo-500" /> Booking Health
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={bookingData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {bookingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Disputes List */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-80 overflow-y-auto custom-scrollbar">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-red-600">
          <FaExclamationTriangle /> Recent Disputes
        </h3>
        <div className="space-y-3">
          {recentDisputes.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center mt-10">No active disputes.</p>
          ) : (
            recentDisputes.map((booking) => (
              <div key={booking._id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-800">Booking #{booking._id.slice(-4)}</p>
                  <p className="text-xs text-red-600">{booking.disputeReason || "No reason provided"}</p>
                </div>
                <button
                  onClick={() => navigate(`/admin-helpdesk`)} // Direct them to helpdesk
                  className="text-xs bg-white border border-red-200 px-2 py-1 rounded text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                >
                  Resolve
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}