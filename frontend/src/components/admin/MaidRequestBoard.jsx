// src/components/admin/MaidRequestBoard.jsx
import React from "react";
import MaidCard from "./MaidCard";

const Badge = ({ count, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{count}</span>
);

export default function MaidRequestBoard({ pending, approved, rejected, onApprove, onReject, onRemove, loadDashboard }) {
  
  const getImgUrl = (path) => 
    path ? (path.startsWith("http") ? path : `http://localhost:5000/${path.replace(/\\/g, "/")}`) : "https://via.placeholder.com/150";

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Board</h1>
          <p className="text-gray-500">Manage incoming applications.</p>
        </div>
        <button onClick={loadDashboard} className="text-sm text-indigo-600 hover:underline">Refresh Data</button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 items-start h-[calc(100vh-220px)]">
        
        {/* PENDING */}
        <div className="w-full min-w-[320px] max-w-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-1 sticky top-0 bg-gray-50 z-10 py-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              PENDING <Badge count={pending.length} color="bg-yellow-100 text-yellow-700" />
            </h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {pending.map((maid) => (
              <MaidCard 
                key={maid._id} 
                maid={maid} 
                getImgUrl={getImgUrl} 
                onApprove={onApprove} 
                onReject={onReject} 
              />
            ))}
            {pending.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No pending requests</p>}
          </div>
        </div>

        {/* APPROVED */}
        <div className="w-full min-w-[320px] max-w-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-1 sticky top-0 bg-gray-50 z-10 py-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              APPROVED <Badge count={approved.length} color="bg-green-100 text-green-700" />
            </h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {approved.map((maid) => (
              <MaidCard 
                key={maid._id} 
                maid={maid} 
                getImgUrl={getImgUrl} 
                statusColor="green" 
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>

        {/* REJECTED */}
        <div className="w-full min-w-[320px] max-w-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-1 sticky top-0 bg-gray-50 z-10 py-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              REJECTED <Badge count={rejected.length} color="bg-red-100 text-red-700" />
            </h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {rejected.map((maid) => (
              <MaidCard 
                key={maid._id} 
                maid={maid} 
                getImgUrl={getImgUrl} 
                statusColor="red"
                extraInfo={
                   <div className="mt-2 text-xs bg-red-50 text-red-600 p-2 rounded">
                    <strong>Reason:</strong> {maid.rejectionReason}
                   </div>
                }
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}