
import React from "react";
import { FaUndo, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function RefundStatus({ booking, userType }) {
  // Only show if there is actually a refund status
  if (!["refunded", "refund_on_hold"].includes(booking.paymentStatus)) return null;

  const isHold = booking.paymentStatus === "refund_on_hold";
  const date = booking.refundDate ? new Date(booking.refundDate).toLocaleDateString() : "Pending";

  return (
    <div className={`mt-3 p-3 rounded-lg border flex items-start gap-3 text-sm ${
      isHold 
        ? "bg-orange-50 border-orange-100 text-orange-800" 
        : "bg-purple-50 border-purple-100 text-purple-800"
    }`}>
      <div className="mt-1">
        {isHold ? <FaClock /> : <FaUndo />}
      </div>
      
      <div className="flex-1">
        <p className="font-bold flex items-center gap-2">
          {isHold ? "Refund Initiated" : "Refund Processed"}
          {isHold && <span className="text-[10px] bg-orange-200 px-1.5 rounded text-orange-800">ON HOLD</span>}
        </p>
        
        <p className="text-xs opacity-80 mt-1">
          {userType === "user" 
            ? `Amount: ₹${booking.refundAmount} has been credited to your source.` 
            : `Amount: ₹${booking.refundAmount} has been reversed from this booking.`}
        </p>

        {!isHold && (
          <p className="text-[10px] mt-2 font-mono opacity-60">
            Ref ID: {booking.refundId?.slice(0, 12)}... • {date}
          </p>
        )}
        
        {isHold && (
          <p className="text-[10px] mt-2 italic opacity-70 flex items-center gap-1">
             <FaExclamationCircle /> Processing at gateway. Will settle in 24-48 hrs.
          </p>
        )}
      </div>
    </div>
  );
}