// src/components/admin/MaidCard.jsx
import React from "react";
import { FaPhone, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";

export default function MaidCard({ maid, getImgUrl, statusColor, onApprove, onReject, onRemove, extraInfo }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
      
      {/* Strike Indicator */}
      {maid.strikes > 0 && (
        <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
          ⚠️ {maid.strikes}/3 Strikes
        </div>
      )}

      <div className="flex items-start gap-3 mt-2">
        <img
          src={getImgUrl(maid.photo)}
          alt={maid.name}
          className="w-12 h-12 rounded-full object-cover border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate">{maid.name}</h4>
          <p className="text-xs text-gray-500 truncate">{maid.serviceType}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${statusColor === 'green' ? 'bg-green-500' : statusColor === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <FaPhone size={12} /> {maid.phone}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <FaMapMarkerAlt size={12} /> {maid.location?.coordinates ? "Loc Detected" : "No Loc"}
        </div>
      </div>

      {/* Docs */}
      {maid.documents && maid.documents.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {maid.documents.map((doc, i) => (
            <a
              key={i}
              href={getImgUrl(doc)}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
            >
              Doc {i + 1}
            </a>
          ))}
        </div>
      )}

      {extraInfo}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
        {onApprove && (
          <button onClick={() => onApprove(maid._id)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 flex items-center justify-center gap-1">
            <FaCheckCircle /> Approve
          </button>
        )}
        {onReject && (
          <button onClick={() => onReject(maid._id)} className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1">
            <FaTimesCircle /> Reject
          </button>
        )}
        {onRemove && (
          <button onClick={() => onRemove(maid._id)} className="w-full py-2 text-red-400 hover:text-red-600 text-xs font-medium flex items-center justify-center gap-1">
            <FaTrash /> Ban User
          </button>
        )}
      </div>
    </div>
  );
}