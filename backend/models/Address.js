import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      required: true,
    },

    fullAddress: {
      type: String,
      required: true,
    },

    lat: {
      type: Number,
      required: true,
    },

    lng: {
      type: Number,
      required: true,
    },

    placeId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
