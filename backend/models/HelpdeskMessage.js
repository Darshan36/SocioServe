import mongoose from "mongoose";


const helpdeskMessageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpdeskTicket",
      required: true
    },

    senderType: {
      type: String,
      enum: ["user", "ai", "admin","system"],
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType",
      default: null
    },

    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("HelpdeskMessage", helpdeskMessageSchema);
