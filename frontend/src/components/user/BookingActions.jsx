import React, { useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import axios from "axios";

const canModifyBooking = (bookingDate, shiftType) => {
  const shiftStartHours = { "Morning": 8, "Full Day": 8, "Evening": 16 };
  const startHour = shiftStartHours[shiftType] || 8;
  const bookingStart = moment(bookingDate).hour(startHour).minute(0).second(0);
  const deadline = bookingStart.clone().subtract(2, "hours");
  return moment().isBefore(deadline);
};

const BookingActions = ({ booking }) => { // Removed onUpdate prop for now
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");

  if (!booking) return null;

  const isActionAllowed = canModifyBooking(booking.date, booking.shift);

  if (['cancelled', 'completed', 'rejected'].includes(booking.status)) {
    return null;
  }

  // --- CANCEL ---
  const handleCancel = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to cancel?")) return;

    try {
      const token = localStorage.getItem("userToken");
      
      console.log("🚀 Sending Cancel Request...");
      
      const res = await axios.put(
          `http://localhost:5000/api/bookings/cancel/${booking._id}`, 
          {}, 
          { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Server Response:", res.data);
      alert("Booking Cancelled!"); // Using alert to pause execution so you see it
      window.location.reload();    // 🔄 FORCE RELOAD TO SHOW CHANGES

    } catch (err) {
      console.error("❌ Cancel Failed:", err);
      toast.error(err.response?.data?.message || "Cancel failed. Check console.");
    }
  };

  // --- RESCHEDULE ---
  const handleReschedule = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newDate) return toast.error("Pick a date");

    try {
      const token = localStorage.getItem("userToken");

      console.log("🚀 Sending Reschedule Request...");

      const res = await axios.put(
          `http://localhost:5000/api/bookings/reschedule/${booking._id}`, 
          { date: newDate }, 
          { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Server Response:", res.data);
      alert("Rescheduled Successfully!");
      window.location.reload(); // 🔄 FORCE RELOAD

    } catch (err) {
      console.error("❌ Reschedule Failed:", err);
      toast.error(err.response?.data?.message || "Reschedule failed");
    }
  };

  if (!isActionAllowed) {
    return <span className="text-gray-400 text-[10px] italic mt-2 block">Cannot cancel (less than 2hrs left)</span>;
  }

  return (
    <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={handleCancel} 
        className="text-red-600 text-xs font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
      >
        Cancel
      </button>
      
      {!isRescheduling ? (
        <button 
            onClick={() => setIsRescheduling(true)} 
            className="text-blue-600 text-xs font-bold border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition"
        >
          Reschedule
        </button>
      ) : (
        <div className="flex gap-1 items-center animate-fadeIn">
          <input 
            type="date" 
            className="text-xs border rounded p-1 w-24" 
            min={moment().format("YYYY-MM-DD")} 
            onChange={(e) => setNewDate(e.target.value)}
            onClick={(e) => e.stopPropagation()} 
          />
          <button onClick={handleReschedule} className="text-white bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700">Save</button>
          <button onClick={() => setIsRescheduling(false)} className="text-gray-400 text-xs hover:text-gray-600">✕</button>
        </div>
      )}
    </div>
  );
};

export default BookingActions;