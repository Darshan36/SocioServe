import React, { useState, useEffect } from "react";
// 1. IMPORT userApi (Replaces axios)
import { userApi } from "../api/userApi";
import toast from "react-hot-toast";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStickyNote,
  FaBriefcase
} from "react-icons/fa";

import AddressPicker from "./AddressPicker"; 

export default function BookingModal({ maid, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Address system
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // -------------------------------------------------------------
  // ✅ FIX: Safe Parsing of serviceType (Handle Array or String)
  // -------------------------------------------------------------
  let availableServices = ["General Cleaning"];

  if (maid?.serviceType) {
    if (Array.isArray(maid.serviceType)) {
        // If it's already an array, use it directly
        availableServices = maid.serviceType;
    } else if (typeof maid.serviceType === "string") {
        // If it's a string, split it
        availableServices = maid.serviceType.split(",").map((s) => s.trim());
    }
  }

  // Parse availability or use defaults
  const availableShifts =
    maid?.availability && maid.availability.length > 0
      ? maid.availability
      : ["Morning", "Afternoon", "Evening", "Full Day"];

  const [formData, setFormData] = useState({
    serviceType: availableServices[0] || "",
    date: "",
    timeSlot: availableShifts[0],
    notes: ""
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        // 2. UPDATED: userApi.get() - No full URL, no headers
        const res = await userApi.get("/api/addresses");
        setAddresses(res.data);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };

    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      return toast.error("Please select an address");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        toast.success("Booking request sent! (Preview)");
        onSuccess?.();
        onClose();
        return;
      }

      // 3. UPDATED: userApi.post() - No full URL, no headers
      await userApi.post(
        "/api/bookings/create",
        {
          maidId: maid._id,
          serviceType: formData.serviceType,
          date: formData.date,
          timeSlots: [formData.timeSlot],
          addressId: selectedAddress._id,
          notes: formData.notes,
        }
      );

      toast.success("Booking request sent!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper to display primary service safely
  const getPrimaryService = () => {
      if (!maid?.serviceType) return "";
      if (Array.isArray(maid.serviceType)) return maid.serviceType[0];
      return maid.serviceType.split(",")[0];
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-50 to-white p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Hire {maid?.name || "Maid"}
            </h3>
            {maid?.serviceType && (
              <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full uppercase">
                {getPrimaryService()}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full border"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">

          {/* Service */}
          {availableServices.length > 1 && (
            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                <FaBriefcase className="text-yellow-600" />
                Select Service
              </label>
              <select
                name="serviceType"
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                {availableServices.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              Select Date
            </label>
            <input
              type="date"
              name="date"
              required
              min={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <FaClock className="text-green-500" />
              Preferred Shift
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableShifts.map((slot) => (
                <label
                  key={slot}
                  className={`cursor-pointer border rounded-lg p-3 text-center text-sm ${
                    formData.timeSlot === slot
                      ? "bg-yellow-50 border-yellow-500 font-bold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot}
                    checked={formData.timeSlot === slot}
                    onChange={handleChange}
                    className="hidden"
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" />
              Service Address
            </label>

            <div className="space-y-2">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedAddress?._id === addr._id
                      ? "border-yellow-600 bg-yellow-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <strong>{addr.label}</strong>
                  <p className="text-xs text-gray-600">{addr.fullAddress}</p>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowAddressPicker(true)}
                className="text-sm text-blue-600 underline"
              >
                + Add new address
              </button>
            </div>
          </div>

          {showAddressPicker && (
            <AddressPicker
              onSelect={(addr) => {
                setAddresses((prev) => [addr, ...prev]);
                setSelectedAddress(addr);
                setShowAddressPicker(false);
              }}
              onClose={() => setShowAddressPicker(false)}
            />
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
              <FaStickyNote />
              Notes
            </label>
            <textarea
              name="notes"
              onChange={handleChange}
              className="w-full p-2 border rounded-lg h-20 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.date || !selectedAddress}
              className="flex-1 py-3 bg-yellow-600 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}