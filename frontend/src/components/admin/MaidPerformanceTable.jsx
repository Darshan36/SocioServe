import React from "react";
import { FaTrophy, FaBriefcase, FaClock } from "react-icons/fa";

export default function MaidPerformanceTable({ stats }) {
  // Access the new data (safely default to empty array)
  const maidPerformance = stats?.maidStats || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" /> Top Performing Maids
        </h3>
        <span className="text-xs text-gray-400 font-medium">
          Based on completed jobs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Maid Name</th>
              <th className="px-6 py-4 text-center">Jobs Completed</th>
              <th className="px-6 py-4 text-center">Hours Worked</th>
              <th className="px-6 py-4 text-center">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {maidPerformance.length > 0 ? (
              maidPerformance.map((maid, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-150">
                  
                  {/* Maid Profile */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="relative">
                        <img 
                        src={maid.photo ? `http://localhost:5000/${maid.photo.replace(/\\/g, "/")}` : "https://via.placeholder.com/40"} 
                        alt={maid.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                        {index < 3 && (
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white ${
                                index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : "bg-orange-400"
                            }`}>
                                {index + 1}
                            </div>
                        )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{maid.name}</p>
                      <p className="text-xs text-gray-400">Rank #{index + 1}</p>
                    </div>
                  </td>

                  {/* Jobs Completed */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                      <FaBriefcase className="text-[10px]" /> {maid.completedJobs}
                    </div>
                  </td>

                  {/* Hours Worked */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                      <FaClock className="text-[10px]" /> {maid.totalHours} hrs
                    </div>
                  </td>

                  {/* Efficiency (Avg Hours per Job) */}
                  <td className="px-6 py-4 text-center">
                     <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        ~{(maid.totalHours / (maid.completedJobs || 1)).toFixed(1)} hrs/job
                     </span>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                  No completed jobs data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}