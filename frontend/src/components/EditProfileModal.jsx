import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaSave, FaUser, FaPhone, FaCheckCircle } from "react-icons/fa";

// Standard Service List
const SERVICE_CATEGORIES = [
  {
    category: "Household",
    services: [
      { id: "cleaning", label: "Cleaning", icon: "🧹" },
      { id: "cooking", label: "Cooking", icon: "🍳" },
      { id: "laundry", label: "Laundry", icon: "👕" },
      { id: "dishwashing", label: "Dishwashing", icon: "🍽️" },
    ]
  },
  {
    category: "Care",
    services: [
      { id: "babysitting", label: "Babysitting", icon: "👶" },
      { id: "eldercare", label: "Elder Care", icon: "👵" },
      { id: "petcare", label: "Pet Care", icon: "🐾" },
      { id: "patientcare", label: "Patient Care", icon: "🏥" },
    ]
  },
  {
    category: "Other",
    services: [
      { id: "driver", label: "Driver", icon: "🚗" },
      { id: "gardener", label: "Gardener", icon: "🌻" },
      { id: "security", label: "Watchman", icon: "👮" },
    ]
  }
];

export default function EditProfileModal({ user, role, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    // Store services as comma-separated string to match backend schema
    serviceType: user?.serviceType || "", 
    availability: user?.availability || []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 1. Availability: Single Selection Logic
  const setSingleAvailability = (slot) => {
    setFormData({ ...formData, availability: [slot] });
  };

  // ✅ 2. Services: Toggle Logic
  const toggleService = (serviceLabel) => {
    let currentServices = formData.serviceType 
      ? formData.serviceType.split(",").map(s => s.trim()).filter(Boolean) 
      : [];

    if (currentServices.includes(serviceLabel)) {
      currentServices = currentServices.filter(s => s !== serviceLabel);
    } else {
      currentServices.push(serviceLabel);
    }

    setFormData({ ...formData, serviceType: currentServices.join(",") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem(role === "maid" ? "maidToken" : "token");
      const endpoint = role === "maid" 
        ? "http://localhost:5000/api/maids/update"
        : "http://localhost:5000/api/users/update";

      await axios.put(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Profile updated successfully!");
      onSuccess(); // Refresh the dashboard
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes size={20}/>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-white focus-within:ring-2 ring-indigo-100">
                  <FaUser className="text-gray-400 mr-2" />
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-white focus-within:ring-2 ring-indigo-100">
                  <FaPhone className="text-gray-400 mr-2" />
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full outline-none text-sm" />
                </div>
              </div>
            </div>

            {/* Maid Specific Fields */}
            {role === "maid" && (
              <>
                {/* Services Grid */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">My Services</label>
                  <div className="border rounded-xl p-3 bg-gray-50 space-y-4">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <div key={cat.category}>
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">{cat.category}</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {cat.services.map((srv) => {
                            // Check if selected
                            const isSelected = formData.serviceType.split(",").map(s => s.trim()).includes(srv.label);
                            return (
                              <div
                                key={srv.id}
                                onClick={() => toggleService(srv.label)}
                                className={`
                                  cursor-pointer p-2 rounded-lg border flex items-center gap-2 transition-all text-sm select-none
                                  ${isSelected 
                                    ? "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm" 
                                    : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
                                  }
                                `}
                              >
                                <span>{srv.icon}</span>
                                <span className="flex-1 truncate">{srv.label}</span>
                                {isSelected && <FaCheckCircle className="text-green-600 text-xs"/>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability (Single Select) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Availability (Choose One)</label>
                  <div className="flex gap-2">
                    {['Morning', 'Evening', 'Full Day'].map(slot => {
                      const isSelected = formData.availability[0] === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSingleAvailability(slot)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer (Fixed) */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <button 
            type="submit" 
            form="edit-form"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {loading ? "Saving..." : <><FaSave /> Save Changes</>}
          </button>
        </div>

      </div>
    </div>
  );
}