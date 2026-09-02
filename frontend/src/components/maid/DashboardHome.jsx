import React from "react";
import { 
  FaUserCircle, FaEdit, FaStar, FaFlagCheckered, FaClipboardList, 
  FaMapMarkerAlt, FaClock, FaChartBar, FaQuoteLeft, FaExclamationTriangle 
} from "react-icons/fa";

export default function DashboardHome({ 
  maid, 
  stats, 
  chartData, 
  reviews, 
  renderImage, 
  setShowEditModal, 
  handleUpdateLocation // <--- New Prop received here
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Strike Warning */}
      {(maid.strikes || 0) > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <div className="bg-red-100 p-2 rounded-full text-red-600 mt-1"><FaExclamationTriangle /></div>
          <div>
            <h3 className="font-bold text-red-800">Warning: Account Strikes ({maid.strikes}/3)</h3>
            <p className="text-sm text-red-700 mt-1">You have received a strike due to a reported "No Show".</p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        <button onClick={() => setShowEditModal(true)} className="absolute top-6 right-6 text-gray-400 hover:text-indigo-600 transition" title="Edit Profile"><FaEdit size={20} /></button>
        
        <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
          {maid.photo ? <img src={renderImage(maid.photo)} className="w-full h-full object-cover" alt="Profile" /> : <FaUserCircle className="w-full h-full text-gray-300" />}
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">{maid.name}</h2>
          <p className="text-gray-500">{maid.serviceType} • {maid.phone}</p>
          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${maid.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{maid.status} Account</span>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
              <FaStar className="text-yellow-500" size={12}/>
              <span className="text-xs font-bold text-gray-700">{maid.averageRating ? maid.averageRating.toFixed(1) : "New"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Graph */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Stats Column */}
        <div className="flex flex-col gap-4 w-full lg:w-1/3">
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-6">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3"><FaFlagCheckered size={24}/></div>
               <h3 className="text-3xl font-extrabold text-gray-800">{stats.completed}</h3>
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Jobs Completed</p>
           </div>
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-6">
               <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-3"><FaClipboardList size={24}/></div>
               <h3 className="text-3xl font-extrabold text-gray-800">{stats.pending}</h3>
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">New Requests</p>
           </div>
        </div>

        {/* Graph Column */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-2/3 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><FaChartBar className="text-indigo-500" size={20}/> Weekly Activity</h3>
          <div className="overflow-x-auto pb-2">
              <div className="flex items-end justify-between h-64 gap-4 mt-2 min-w-[300px]"> 
                 {chartData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                        <div 
                          className="w-full bg-indigo-100 rounded-t-md relative transition-all duration-500 hover:bg-indigo-200" 
                          style={{ height: `${data.count > 0 ? Math.min(data.count * 20, 100) : 5}%`, minHeight: '8px' }}
                        >
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                             {data.count} Jobs
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 mt-3 font-medium">{data.day}</span>
                    </div>
                  ))}
              </div>
          </div>
        </div>
      </div>

      {/* Reviews & Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Reviews Column */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 overflow-hidden flex flex-col">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaStar className="text-yellow-500" size={18}/> Recent Reviews</h3>
             <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {reviews.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-lg"><p className="text-gray-400 text-sm italic">No reviews yet.</p></div>
                ) : (
                  reviews.map((review) => (
                      <div key={review._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                         <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm text-gray-700">{review.userId?.name || "Client"}</span>
                            <div className="flex text-yellow-400 text-xs">{[...Array(5)].map((_, i) => <FaStar key={i} size={10} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />)}</div>
                         </div>
                         <p className="text-sm text-gray-600 flex gap-2"><FaQuoteLeft className="text-gray-300 flex-shrink-0" size={10}/> {review.comment}</p>
                      </div>
                  ))
                )}
             </div>
          </div>

          {/* Availability & Location Column */}
          <div className="space-y-6">
              
              {/* Availability */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FaClock size={18}/> Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {maid.availability?.length > 0 ? maid.availability.map((slot, i) => <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium border border-blue-100">{slot}</span>) : <p className="text-gray-400">No slots set</p>}
                </div>
              </div>

              {/* Service Location (UPDATED) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <FaMapMarkerAlt size={18}/> Service Location
                  </h3>
                  
                  {/* UPDATE LOCATION BUTTON */}
                  <button 
                    onClick={handleUpdateLocation}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-200 hover:bg-blue-100 transition flex items-center gap-1"
                  >
                    <FaMapMarkerAlt size={10} /> Update to Here
                  </button>
                </div>

                <p className="text-gray-600 text-sm font-mono bg-gray-50 p-2 rounded break-all">
                  {maid.location?.coordinates 
                    ? `${maid.location.coordinates[1].toFixed(6)}, ${maid.location.coordinates[0].toFixed(6)}` 
                    : "Location not set"}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  * Click update if you have moved to a new service area. Users find you based on this location.
                </p>
              </div>

          </div>
      </div>
    </div>
  );
}