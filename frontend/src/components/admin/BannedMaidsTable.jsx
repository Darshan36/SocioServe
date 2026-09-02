// src/components/admin/BannedMaidsTable.jsx
import React from "react";
import { FaBan } from "react-icons/fa";

export default function BannedMaidsTable({ bannedMaids }) {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaBan className="text-red-600" /> Restricted Users
        </h1>
        <p className="text-gray-500">Maids who have been banned or have reached 3 strikes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Strikes</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bannedMaids.map((maid) => (
              <tr key={maid._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{maid.name}</div>
                  <div className="text-xs text-gray-400">{maid.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-xs">
                    {maid.strikes} / 3
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(maid.joinedDate || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                    {maid.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs text-blue-600 hover:underline">
                    Review Case
                  </button>
                </td>
              </tr>
            ))}
            {bannedMaids.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No banned users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}