import React, { useState } from "react";
// 1. IMPORT userApi (Replaces axios)
import { userApi } from "../api/userApi";
import toast from "react-hot-toast";
import { FaStar, FaTimes, FaPaperPlane } from "react-icons/fa";

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); 
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");

    setLoading(true);

    try {
      // 2. UPDATED: userApi.post() - No full URL, no headers
      await userApi.post("/api/reviews/add", {
        maidId: booking.maidId._id,
        bookingId: booking._id,
        rating,
        comment,
      });

      toast.success("Review submitted successfully!");
      onSuccess(); 
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-yellow-50 to-white p-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Rate Your Experience</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            How was the service provided by <span className="font-bold text-gray-800">{booking.maidId?.name}</span>?
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index} className="cursor-pointer transition hover:scale-110">
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    className="hidden"
                    onClick={() => setRating(ratingValue)}
                  />
                  <FaStar
                    size={32}
                    className="transition-colors duration-200"
                    color={ratingValue <= (hover || rating) ? "#fbbf24" : "#e5e7eb"}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>

          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none text-sm"
            rows="3"
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 bg-yellow-600 text-white rounded-lg font-bold shadow-md hover:bg-yellow-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Submitting..." : <><FaPaperPlane size={16} /> Submit Review</>}
          </button>
        </form>
      </div>
    </div>
  );
}