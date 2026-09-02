import React from "react";
import { FaHourglassHalf, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaComments, FaCheck } from "react-icons/fa";

export default function JobRequests({ pendingJobs, activeJobs, overdueJobs, handleStatusUpdate, verifyOtpAndStart, setActiveChat, currentUser }) {

  // Helper inside component
  const renderAddress = (job) => {
    if (job.addressId?.fullAddress) return job.addressId.fullAddress;
    if (typeof job.address === 'string') return job.address;
    return "Unavailable";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Pending */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FaHourglassHalf className="text-yellow-500" size={20} /> Pending Requests</h2>
        {pendingJobs.length === 0 ? <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200"><p className="text-gray-400 italic">No new job requests.</p></div> : 
          <div className="grid gap-4">
            {pendingJobs.map(job => (
              <div key={job._id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{job.userId?.name || "Resident"}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><FaMapMarkerAlt className="text-red-500"/> {renderAddress(job)}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><FaClock className="text-blue-500"/> {new Date(job.date).toLocaleDateString()} • {job.timeSlots?.join(', ')}</p>
                  {job.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">"{job.notes}"</p>}
                </div>
                <div className="flex gap-3 items-center">
                  <button onClick={() => handleStatusUpdate(job._id, "accepted")} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"><FaCheckCircle/> Accept</button>
                  <button onClick={() => handleStatusUpdate(job._id, "rejected")} className="px-6 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 flex items-center gap-2"><FaTimesCircle/> Reject</button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Active */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FaCheckCircle className="text-green-500" size={20} /> Active Jobs</h2>
        {activeJobs.length === 0 ? <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200"><p className="text-gray-400 italic">No active jobs.</p></div> : 
          <div className="grid gap-4 sm:grid-cols-2">
            {activeJobs.map(job => (
              <div key={job._id} className="bg-white p-5 rounded-xl shadow-sm border border-green-200 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-3">
                      <div><h3 className="font-bold text-gray-800">{job.userId?.name}</h3><p className="text-sm text-gray-500">{job.userId?.phone}</p></div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{job.status === 'in_progress' ? 'In Progress' : 'Accepted'}</span>
                   </div>
                   <p className="text-sm text-gray-700"><strong>Date:</strong> {new Date(job.date).toLocaleDateString()}</p>
                   <p className="text-sm text-gray-700"><strong>Slot:</strong> {job.timeSlots.join(", ")}</p>
                   <p className="text-sm text-gray-700 mt-1 flex items-start gap-2"><FaMapMarkerAlt className="mt-1 text-red-500"/> {renderAddress(job)}</p>
                </div>
                <div className="mt-4 space-y-2">
                   {job.status === 'accepted' && <button onClick={() => { const otp = prompt("Enter 4-digit OTP:"); if(otp) verifyOtpAndStart(job._id, otp); }} className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">▶ Start Job</button>}
                   {job.status === 'in_progress' && <button onClick={() => handleStatusUpdate(job._id, "completed")} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">⏹ End Job</button>}
                   <button onClick={() => setActiveChat({ bookingId: job._id, recipientName: job.userId?.name, currentUser: { id: currentUser._id, name: currentUser.name } })} className="w-full flex items-center justify-center gap-2 py-2 border border-blue-300 text-blue-600 rounded text-sm font-medium hover:bg-blue-50"><FaComments /> Chat</button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {overdueJobs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Missed / Overdue Jobs</h2>
          {overdueJobs.map(job => (
            <div key={job._id} className="bg-red-50 border border-red-200 p-4 rounded-xl mb-2">
              <h3 className="font-bold">{job.userId?.name}</h3>
              <p className="text-sm text-red-600">This job was not started on time ({new Date(job.date).toDateString()})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}