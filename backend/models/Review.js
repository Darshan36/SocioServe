import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    maidId: { type: mongoose.Schema.Types.ObjectId, ref: "Maid", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent user from reviewing the same booking twice
reviewSchema.index({ bookingId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);