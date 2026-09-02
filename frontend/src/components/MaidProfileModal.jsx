import React, { useEffect, useState } from "react";
import axios from "axios";

// 🔄 Replaced lucide-react with react-icons/fa
import {
  FaTimes,
  FaStar,
  FaUser,
  FaMapMarkerAlt,
  FaQuoteLeft
} from "react-icons/fa";

export default function MaidProfileModal({ maid, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "New";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/${maid._id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [maid._id]);

  const renderImage = (path) =>
    path ? (path.startsWith("http") ? path : `http://localhost:5000/${path.replace(/\\/g, "/")}`) : null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn my-auto relative">

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-black/10 p-2 rounded-full text-gray-800 transition backdrop-blur-md"
        >
          <FaTimes size={20} />
        </button>

        <div className="bg-gray-100 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
              {maid.photo ? (
                <img src={renderImage(maid.photo)} alt={maid.name} className="w-full h-full object-cover" />
              ) : (
                <FaUser size={60} className="text-gray-300" />
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{maid.name}</h2>
              <p className="text-yellow-600 font-semibold uppercase tracking-wide text-sm mt-1">{maid.serviceType}</p>
            </div>

            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
              <FaStar className="text-yellow-500" size={16} />
              <span className="font-bold text-gray-800">{averageRating}</span>
              <span className="text-gray-500 text-xs">({reviews.length} reviews)</span>
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          <h3 className="font-bold text-gray-800 mb-4 text-lg">Client Reviews</h3>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-400 italic">No reviews yet. Be the first to hire!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {review.userId?.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-sm text-gray-700">{review.userId?.name || "Resident"}</span>
                    </div>

                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={12}
                          color={i < review.rating ? "#facc15" : "#e5e7eb"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm pl-10 relative">
                    <FaQuoteLeft className="absolute left-2 top-0 text-gray-300 opacity-50" size={12} />
                    {review.comment}
                  </p>

                  <p className="text-right text-[10px] text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
