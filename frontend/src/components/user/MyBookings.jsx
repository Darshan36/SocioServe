import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import MaidCard from "./MaidCard"; 
import RefundStatus from "../RefundStatus"; // <--- 1. IMPORT ADDED

export default function MyBookings({ 
  myHires, 
  renderImage, 
  setActiveChat, 
  setBookingToReview, 
  handleReportNoShow, 
  setActiveTab,
  onUpdate,       
  handlePayment, 
  currentUser
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
      <div className="space-y-4">
        {myHires.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            <FaCalendarAlt size={48} className="mx-auto text-gray-300 mb-4"/>
            <p>You haven't made any bookings yet.</p>
            <button onClick={() => setActiveTab('search')} className="mt-4 text-blue-600 font-bold hover:underline">Find a Maid</button>
          </div>
        ) : (
          myHires.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* ✅ MAID CARD HANDLES INFO & ACTIONS */}
                <MaidCard 
                  data={booking} 
                  variant="list" 
                  renderImage={renderImage}
                  bookingStatus={booking.status}
                  startOtp={booking.startOtp}
                  onAction={(actionType) => {
                      if (actionType === 'pay') {
                          handlePayment(booking);
                      } else {
                          setActiveChat({ 
                              bookingId: booking._id, 
                              recipientName: booking.maidId?.name, 
                              currentUser: currentUser || { id: "me", name: "You" } 
                          });
                      }
                  }}
                  onSecondaryAction={() => setBookingToReview(booking)}
                  onTertiaryAction={() => handleReportNoShow(booking._id)}
                />

                {/* 👇 2. INSERTED REFUND STATUS HERE */}
                {/* This ensures the status appears at the bottom of the card if a refund exists */}
                <RefundStatus booking={booking} userType="user" />

            </div>
          ))
        )}
      </div>
    </div>
  );
}