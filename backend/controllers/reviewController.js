import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

// --- 1. Add a Review ---
export const addReview = async (req, res) => {
  try {
    const { maidId, bookingId, rating, comment } = req.body;

    // A. Validate Booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // B. Security Checks
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed jobs" });
    }

    // C. Create Review
    const newReview = new Review({
      userId: req.user.id,
      maidId,
      bookingId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json({ message: "Review submitted successfully", review: newReview });

  } catch (err) {
    // Check for duplicate review error (E11000)
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

// --- 2. Get Reviews for a Maid ---
export const getMaidReviews = async (req, res) => {
  try {
    const { maidId } = req.params;

    const reviews = await Review.find({ maidId })
      .populate("userId", "name") // Get reviewer's name
      .sort({ createdAt: -1 });   // Newest first

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};