import mongoose from "mongoose";
import bcrypt from "bcrypt";

const maidSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true, unique: true },

    // 🛑 FIXED: Changed from String to [String] (Array)
    serviceType: { type: [String], required: true },
    
    availability: { type: [String], default: [] },

    // NEW
    photo: { type: String },
    documents: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "removed", "suspended"],
      default: "pending",
    },

    strikes: { type: Number, default: 0 },

    rejectionReason: { type: String, default: "" },

    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "pending",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // hide in query
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

maidSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Maid", maidSchema);