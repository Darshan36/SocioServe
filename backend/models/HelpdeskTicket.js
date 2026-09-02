import mongoose from "mongoose";

const helpdeskTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      refPath: 'userModel'
    },

    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Maid'] 
    },
        
    bookingId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Booking",
  required: false
},


    subject: {
      type: String,
      default: "Support Request"
    },

    status: {
      type: String,
      enum: ["open", "ai", "human", "resolved"],
      default: "ai"
    },

    escalated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("HelpdeskTicket", helpdeskTicketSchema);
