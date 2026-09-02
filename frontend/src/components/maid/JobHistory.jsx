import React from "react";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFlagCheckered, 
  FaRegCalendarTimes, 
  FaExclamationTriangle, 
  FaUndo 
} from "react-icons/fa";
import RefundStatus from "../RefundStatus"; 

export default function JobHistory({ historyJobs }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed": return <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs font-bold"><FaFlagCheckered /> Completed</span>;
      case "rejected": case "cancelled": return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><FaTimesCircle /> {status}</span>;
      case "expired": return <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold"><FaRegCalendarTimes /> Expired</span>;
      case "no_show": return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><FaExclamationTriangle /> No Show</span>;
      case "refunded": return <span className="flex items-center gap-1 text-purple-700 bg-purple-100 px-2 py-1 rounded text-xs font-bold"><FaUndo /> Refunded</span>;
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">Job History</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Date</th>
              {/* 👇 Added Amount Header */}
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historyJobs.map(job => (
              <tr key={job._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                    {job.userId?.name || "Unknown"}
                </td>
                <td className="px-6 py-4">
                    {new Date(job.date).toLocaleDateString()}
                </td>
                
                {/* 👇 Added Amount Cell (Checking price, totalAmount, or amount) */}
                <td className="px-6 py-4 font-bold text-green-600">
                    ₹{job.price || job.totalAmount || job.amount || 0}
                </td>

                <td className="px-6 py-4">
                     <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(job.status)}
                        <RefundStatus booking={job} userType="maid" />
                    </div>
                </td>
              </tr>
            ))}
            {historyJobs.length === 0 && (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                        No past jobs found
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}