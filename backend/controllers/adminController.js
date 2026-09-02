import Maid from "../models/Maid.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    // ---------------------------------------------------------
    // 1. MAID COUNTS (Detailed Status)
    // ---------------------------------------------------------
    const totalMaids = await Maid.countDocuments();
    
    // Count both 'active' AND 'approved' statuses
    const activeMaids = await Maid.countDocuments({ 
        $or: [{ status: "active" }, { status: "approved" }] 
    });
    
    const pendingMaids = await Maid.countDocuments({ status: "pending" });
    
    const bannedMaids = await Maid.countDocuments({ 
        $or: [{ status: "banned" }, { strikes: { $gte: 3 } }] 
    });

    // ---------------------------------------------------------
    // 2. BOOKING COUNTS & ACTIVE HIRES
    // ---------------------------------------------------------
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    const disputedBookings = await Booking.countDocuments({ isDisputed: true });
    
    // Fix: Explicitly calculate active hires to avoid ReferenceError
    const activeHires = await Booking.countDocuments({ 
        status: { $in: ["accepted", "in_progress"] } 
    });

    // ---------------------------------------------------------
    // 3. REVENUE CALCULATION (Robust)
    // ---------------------------------------------------------
    // We sum 'amount'. If 'amount' is missing (legacy data), we use 'totalAmount'.
    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          // Match bookings that are PAID (case-insensitive)
          paymentStatus: { $regex: /^paid$/i } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          // Sum 'amount', fallback to 'totalAmount'
          totalRevenue: { $sum: { $ifNull: ["$amount", "$totalAmount"] } } 
        } 
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // ---------------------------------------------------------
    // 4. RECENT DISPUTES
    // ---------------------------------------------------------
    const recentDisputes = await Booking.find({ isDisputed: true })
      .populate("userId", "name")
      .populate("maidId", "name")
      .limit(5)
      .sort({ updatedAt: -1 });

    // ---------------------------------------------------------
    // 5. MAID PERFORMANCE STATS (Safe Aggregation)
    // ---------------------------------------------------------
    const maidStats = await Booking.aggregate([
      { 
        $match: { status: "completed" } 
      },
      // Safe Date Conversion: Ensure strings are converted to Date objects
      {
        $project: {
          maidId: 1,
          safeStart: { $toDate: "$startTime" },
          safeEnd: { $toDate: "$endTime" }
        }
      },
      // Filter out invalid dates to prevent errors
      {
        $match: {
          safeStart: { $ne: null },
          safeEnd: { $ne: null }
        }
      },
      // Calculate Duration
      {
        $project: {
          maidId: 1,
          durationMs: { $subtract: ["$safeEnd", "$safeStart"] }
        }
      },
      // Group by Maid
      {
        $group: {
          _id: "$maidId",
          completedJobs: { $sum: 1 },
          totalHoursMs: { $sum: "$durationMs" }
        }
      },
      // Lookup Maid Details
      {
        $lookup: {
          from: "maids", // Ensure this matches your DB collection name
          localField: "_id",
          foreignField: "_id",
          as: "maidDetails"
        }
      },
      { $unwind: "$maidDetails" },
      // Final Projection
      {
        $project: {
          name: "$maidDetails.name",
          photo: "$maidDetails.photo",
          completedJobs: 1,
          // Convert MS to Hours (rounded to 1 decimal place)
          totalHours: { 
             $round: [{ $divide: ["$totalHoursMs", 3600000] }, 1] 
          }
        }
      },
      { $sort: { completedJobs: -1 } },
      { $limit: 10 }
    ]);

    // ---------------------------------------------------------
    // 6. FINAL RESPONSE
    // ---------------------------------------------------------
    res.json({
      maids: { 
          total: totalMaids, 
          active: activeMaids, 
          pending: pendingMaids, 
          banned: bannedMaids 
      },
      bookings: { 
          total: totalBookings, 
          completed: completedBookings, 
          cancelled: cancelledBookings, 
          disputed: disputedBookings,
          active: activeHires // Included here
      },
      revenue: totalRevenue,
      recentDisputes,
      maidStats 
    });

  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats", error: err.message });
  }
};

// GET /api/admin/banned-maids
export const getBannedMaids = async (req, res) => {
    try {
        const banned = await Maid.find({
            $or: [{ status: "banned" }, { strikes: { $gte: 3 } }] 
        }).select("name email phone strikes joinedDate");
        
        res.json(banned);
    } catch (err) {
        res.status(500).json({ message: "Error fetching banned maids" });
    }
};

// GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    // Filter by Status
    if (status && status !== "all") {
        if (status === "disputed") query.isDisputed = true;
        else query.status = status;
    }

    // Search by Transaction ID (Case Insensitive)
    if (search) {
        query.transactionId = { $regex: search, $options: "i" };
    }

    const bookings = await Booking.find(query)
      .populate("userId", "name email phone")
      .populate("maidId", "name serviceType")
      .sort({ createdAt: -1 }); // Newest first

    res.json(bookings);
  } catch (err) {
    console.error("Admin Booking Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};