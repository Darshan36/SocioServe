import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    maidId: { type: mongoose.Schema.Types.ObjectId, ref: "Maid", required: true },
    serviceType: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlots: { type: [String], required: true }, 
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    
    // Booking Status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled", "expired", "in_progress", "no_show"],
      default: "pending",
    },
    notes: { type: String, default: "" },

    /* ------------------------------------------------
       💰 PAYMENT & REFUND FIELDS (Consolidated)
    ------------------------------------------------ */
    transactionId: { type: String }, // Stores Cashfree Order ID
    
    // We keep both 'amount' and 'totalAmount' for backward compatibility
    amount: { type: Number },      
    totalAmount: { type: Number, default: 0 }, 
    
    // 🛑 FIX: Added 'refund_on_hold' to prevent 500 Errors
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed', 'refunded', 'refund_on_hold'], 
        default: 'pending' 
    },
    
    /* ------------------------------------------------
       ⚠️ DISPUTE & REFUND DETAILS
    ------------------------------------------------ */
    isDisputed: { type: Boolean, default: false },
    disputeReason: { type: String }, 
    adminNotes: { type: String },    
    
    refundId: { type: String },      
    refundAmount: { type: Number },
    refundDate: { type: Date },

    /* ------------------------------------------------
       🚀 JOB EXECUTION FIELDS
    ------------------------------------------------ */
    hourlyRate: { type: Number, required: false }, 
    startOtp: { type: String },
    startTime: { type: Date }, 
    endTime: { type: Date },   
    totalHours: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);