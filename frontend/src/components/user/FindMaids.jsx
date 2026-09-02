import React from "react";
import { FaSync, FaLocationArrow, FaFilter, FaMap, FaSearch } from "react-icons/fa";
import NearbyMap from "../NearbyMap";
import MaidCard from "./MaidCard"; // ✅ Uses new unified card

export default function FindMaids({ 
  findNearbyMaids, loadingNearby, filter, setFilter, availableServices, nearby, 
  filteredMaids, renderImage, setSelectedMaidProfile, setSelectedMaidForBooking,
  showMap, setShowMap, userLocation
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Find Help</h2>
        <div className="flex gap-2">
           <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition ${showMap ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}>
              <FaMap /> {showMap ? "Hide Map" : "Show Map"}
           </button>
           <button onClick={() => findNearbyMaids(true)} disabled={loadingNearby} className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium transition">
              {loadingNearby ? <FaSync className="animate-spin"/> : <FaLocationArrow />} Refresh
           </button>
        </div>
      </header>

      {showMap && <div className="h-80 rounded-xl overflow-hidden shadow-md border"><NearbyMap maids={nearby} userLocation={userLocation} onBookClick={setSelectedMaidForBooking}/></div>}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <span className="font-bold text-gray-500 text-sm flex items-center gap-2"><FaFilter/> FILTERS:</span>
        <select onChange={(e) => setFilter({ ...filter, serviceType: e.target.value })} value={filter.serviceType} className="px-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none capitalize cursor-pointer">
          <option value="">All Services</option>
          {availableServices.map(service => (<option key={service} value={service}>{service}</option>))}
        </select>
        <select onChange={(e) => setFilter({ ...filter, availability: e.target.value })} className="px-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"><option value="">All Slots</option><option value="Morning">Morning</option><option value="Evening">Evening</option></select>
      </div>

      {/* NEARBY (Slider) */}
      {nearby.length > 0 && !showMap && (
         <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Maids Near You</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {nearby.map((maid) => (
                  <div key={maid._id} className="min-w-[320px] snap-center">
                      <MaidCard 
                        data={maid} 
                        variant="grid" 
                        isCompact={false} // Full size
                        renderImage={renderImage} 
                        onAction={() => setSelectedMaidForBooking(maid)} 
                        onSecondaryAction={() => setSelectedMaidProfile(maid)}
                      />
                  </div>
              ))}
            </div>
            <hr className="border-gray-200"/>
         </div>
      )}

      {/* ALL MAIDS (Grid) */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">All Professionals</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMaids.map((maid) => (
             <MaidCard 
               key={maid._id} 
               data={maid} 
               variant="grid" 
               isCompact={true} // Compact mode
               renderImage={renderImage} 
               onAction={() => setSelectedMaidForBooking(maid)} 
               onSecondaryAction={() => setSelectedMaidProfile(maid)} 
             />
          ))}
        </div>
        {filteredMaids.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <FaSearch className="mx-auto text-gray-300 mb-4" size={40} />
                <h3 className="text-gray-500 font-medium">No maids found matching your filters.</h3>
            </div>
        )}
      </div>
    </div>
  );
}