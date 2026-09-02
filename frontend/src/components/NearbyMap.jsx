import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ✅ CRITICAL FIX: Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map when location changes or map loads
function MapUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 14);
      map.invalidateSize(); 
    }
  }, [lat, lng, map]);
  return null;
}

export default function NearbyMap({ maids, userLocation, onBookClick }) {
  // Default to a central location (e.g. Mumbai) if user loc is missing
  const centerLat = userLocation?.lat || 19.0760;
  const centerLng = userLocation?.lng || 72.8777;

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md border border-gray-200 relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater lat={centerLat} lng={centerLng} />

        {/* User's Location Marker */}
        {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                    <strong>You are here</strong>
                </Popup>
            </Marker>
        )}

        {/* Maid Markers */}
        {maids.map((maid) => {
          if (!maid.location || !maid.location.coordinates) return null;
          
          const [lng, lat] = maid.location.coordinates;

          // 👇 LOGIC FIX: Handle both Arrays and Strings
          let serviceLabel = "Maid";
          if (Array.isArray(maid.serviceType) && maid.serviceType.length > 0) {
              serviceLabel = maid.serviceType[0]; // Take first item if Array
          } else if (typeof maid.serviceType === 'string') {
              serviceLabel = maid.serviceType.split(',')[0]; // Split if String
          }

          return (
            <Marker key={maid._id} position={[lat, lng]}>
              <Popup>
                <div className="text-center min-w-[150px]">
                   <img 
                      src={maid.photo ? (maid.photo.startsWith("http") ? maid.photo : `http://localhost:5000/${maid.photo.replace(/\\/g, "/")}`) : "https://via.placeholder.com/50"} 
                      className="w-10 h-10 rounded-full mx-auto mb-2 object-cover border"
                      alt={maid.name}
                   />
                   <h3 className="font-bold text-gray-800">{maid.name}</h3>
                   
                   {/* 👇 UPDATED RENDERING */}
                   <p className="text-xs text-gray-500 uppercase font-bold mb-2">
                     {serviceLabel}
                   </p>

                   <button 
                      onClick={() => onBookClick(maid)}
                      className="bg-yellow-600 text-white text-xs px-3 py-1.5 rounded hover:bg-yellow-700 w-full font-bold transition"
                   >
                      Book Now
                   </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}