import React, { useState } from "react";
import { 
  FaStar, FaClock, FaMapMarkerAlt, FaCheckCircle, 
  FaTimesCircle, FaFlagCheckered, FaComments, 
  FaExclamationTriangle, FaRegCalendarTimes, FaUserCircle,
  FaChevronDown, FaBriefcase 
} from "react-icons/fa";

// 🛑 1. IMPORT THE NEW COMPONENT
import BookingActions from "./BookingActions"; 

export default function MaidCard({ 
  data, 
  variant = "grid", 
  isCompact = false, 
  onAction, 
  onSecondaryAction, 
  onTertiaryAction, 
  renderImage
}) {
  const [showSkills, setShowSkills] = useState(false); 
  
  const profile = data.maidId ? data.maidId : data;

  // --- 1. PARSE SERVICES (Safe for Array vs String) ---
  const allServices = Array.isArray(profile.serviceType) 
    ? profile.serviceType 
    : (profile.serviceType || "").split(",");
  const visibleServices = allServices.slice(0, 3);
  const remainingCount = allServices.length - 3;

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'accepted': 
        return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200"><FaCheckCircle/> Hired</span>;
      case 'in_progress': 
        return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold border border-blue-200"><FaClock/> Working</span>;
      case 'completed': 
        return <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-200"><FaFlagCheckered/> Done</span>;
      case 'rejected': 
      case 'cancelled': 
        return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold border border-red-200"><FaTimesCircle/> {status === 'rejected' ? 'Rejected' : 'Cancelled'}</span>;
      case 'expired': 
        return <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-300"><FaRegCalendarTimes/> Expired</span>;
      case 'no_show': 
        return <span className="flex items-center gap-1 text-red-800 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200"><FaExclamationTriangle/> No Show</span>;
      default: 
        return <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs font-bold border border-yellow-200"><FaClock/> Pending</span>;
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
       {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.round(rating || 0) ? "" : "text-gray-300"} />)}
       <span className="text-gray-500 font-medium ml-1">{rating ? rating.toFixed(1) : "New"}</span>
    </div>
  );

  // --- GRID VARIANT ---
  if (variant === "grid") {
    return (
      <div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative"
        onMouseLeave={() => setShowSkills(false)} 
      >
        {/* 1. IMAGE */}
        <div className={`${isCompact ? 'h-40' : 'h-48'} relative bg-gray-100 flex-shrink-0 rounded-t-2xl overflow-hidden`}>
           {profile.photo ? (
             <img src={renderImage(profile.photo)} alt={profile.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300"><FaUserCircle size={isCompact ? 40 : 50}/></div>
           )}
           {data.distance && (
             <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                <FaMapMarkerAlt className="text-red-500" /> {data.distance.toFixed(1)} km
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
           <div className="absolute bottom-3 left-4 text-white">
             <h3 className={`font-bold leading-tight ${isCompact ? 'text-base' : 'text-lg'}`}>{profile.name}</h3>
             {renderStars(profile.averageRating)}
           </div>
        </div>

        {/* 2. CARD BODY */}
        <div className={`flex-1 flex flex-col ${isCompact ? 'p-3' : 'p-4'}`}>
            <div className="flex flex-wrap gap-1.5 mb-2 h-[46px] content-start relative z-10">
                {visibleServices.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-[10px] font-bold uppercase border border-gray-200 tracking-wide whitespace-nowrap">
                        {s}
                    </span>
                ))}
                {remainingCount > 0 && (
                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSkills(!showSkills);
                            }}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold border border-gray-200 whitespace-nowrap hover:bg-gray-200 transition cursor-pointer flex items-center gap-1"
                        >
                            +{remainingCount} more <FaChevronDown size={8} />
                        </button>
                        {showSkills && (
                            <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 p-2 rounded-lg shadow-xl z-50 flex flex-col gap-1 animate-fadeIn">
                                {allServices.slice(3).map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-100 text-center">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-auto">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3 border-t border-gray-100 pt-2">
                    <span className="flex items-center gap-1" title="Availability">
                        <FaClock className="text-gray-400"/> {profile.availability ? profile.availability[0] : "Flex"}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100" title="Total Completed Jobs">
                        <FaBriefcase size={10} /> {profile.completedJobs || 0} Jobs
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onSecondaryAction} className="py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        Profile
                    </button>
                    <button onClick={onAction} className="py-2 text-xs font-bold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 shadow-md transition">
                        Book
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- LIST VARIANT (Bookings) ---
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start md:items-center">
        <div className="flex items-center gap-4 flex-1">
            <img src={renderImage(profile.photo)} className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" alt={profile.name} />
            <div>
                <h4 className="font-bold text-gray-800 text-lg">{profile.name || "Unknown Maid"}</h4>
                <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                    <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{data.serviceType}</span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1 text-indigo-600 font-medium text-xs">
                        <FaBriefcase size={10} /> {profile.completedJobs || 0} Jobs
                    </span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span>{new Date(data.date).toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            {getStatusBadge(data.status)}
            {['accepted', 'in_progress'].includes(data.status) && data.startOtp && (
                <div className="text-xs bg-green-50 text-green-800 px-3 py-1 rounded border border-green-200 font-mono font-bold tracking-widest">
                    OTP: {data.startOtp}
                </div>
            )}
            
            {/* --- ACTION BUTTONS --- */}
            <div className="flex gap-2 mt-1 flex-wrap justify-end">
                
                {/* 🛑 2. ADD BOOKING ACTIONS (Cancel / Reschedule) */}
                <BookingActions booking={data} onUpdate={() => window.location.reload()} />
                
                {/* 1. Chat Button */}
                {data.status === 'accepted' && (
                    <button onClick={onAction} className="flex items-center justify-center gap-2 py-1.5 px-3 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-bold hover:bg-blue-100">
                       <FaComments /> Chat
                    </button>
                )}

                {/* 2. Pay Button (Visible if Completed + Pending Payment) */}
                {data.status === 'completed' && data.paymentStatus === 'pending' && (
                    <button 
                        onClick={() => onAction('pay')} 
                        className="flex items-center gap-1 text-xs bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-700 shadow-md transition animate-pulse"
                    >
                        Pay ₹{data.totalAmount}
                    </button>
                )}

                 {/* 3. Rate Button (Visible if Completed + Paid) */}
                 {data.status === 'completed' && data.paymentStatus === 'paid' && (
                      <button onClick={onSecondaryAction} className="flex items-center justify-center gap-2 py-1.5 px-3 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg font-bold hover:bg-yellow-100">
                          <FaStar /> Rate
                      </button>
                )}
                
                {/* 4. Report Button */}
                {data.status === 'accepted' && new Date(data.date) < new Date().setHours(0,0,0,0) && (
                    <button onClick={onTertiaryAction} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 font-bold hover:bg-red-100 transition">
                        <FaExclamationTriangle /> Report
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}