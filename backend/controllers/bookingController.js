import Booking from "../models/Booking.js";
import Maid from "../models/Maid.js";
import User from "../models/User.js";
import { sendBookingRequestMail } from "../config/email.js"; 
import { sendNotification } from "../config/firebaseAdmin.js";
import moment from "moment";

// ✅ IMPORT THE NEW BACKEND CONSTANTS
import { getServiceRate } from "../config/services.js"; 

const SLOT_LIMITS = {
  "Full Day": 1,
  "Morning": 2, 
  "Afternoon": 2,
  "Evening": 2
};

// --- 1. Create a New Booking (User) ---
export const createBooking = async (req, res) => {
  try {
    const { maidId, serviceType, date, timeSlots, addressId, notes } = req.body;

    if (!maidId || !date || !addressId || !timeSlots || timeSlots.length === 0) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const requestedSlot = timeSlots[0]; 
    const limit = SLOT_LIMITS[requestedSlot] || 2;

    // A. Check Availability
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookingCount = await Booking.countDocuments({
      maidId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "accepted", "in_progress"] },
      timeSlots: { $in: [requestedSlot] }
    });

    const hasFullDayBooking = await Booking.exists({
      maidId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "accepted", "in_progress"] },
      timeSlots: { $in: ["Full Day"] }
    });

    if (hasFullDayBooking) {
        return res.status(409).json({ message: "Maid is booked for the Full Day on this date." });
    }

    if (bookingCount >= limit) {
      return res.status(409).json({ 
        message: `Maid is busy. Only ${limit} booking(s) allowed for '${requestedSlot}' shift.` 
      });
    }

    // B. Security: Calculate Rate on Server Side
    const rate = getServiceRate(serviceType); 

    // C. Create Booking
    const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking = new Booking({
      userId: req.user.id,
      maidId,
      serviceType,
      date,
      timeSlots, 
      addressId,
      notes,
      startOtp,
      status: "pending",
      
      // 💰 FINANCIAL FIELDS
      hourlyRate: rate, // Save the rate NOW so it doesn't change later
      totalAmount: 0,   // Starts at 0, calculated when job ends
      paymentStatus: "pending"
    });

    await newBooking.save();

    // D. Notifications
    const maid = await Maid.findById(maidId);
    const user = await User.findById(req.user.id);
    
    if (maid && user) {
        try {
            await sendBookingRequestMail(maid.email, {
                maidName: maid.name,
                userName: user.name,
                serviceType,
                date,
                timeSlot: requestedSlot,
                addressId,
                notes
            });
        } catch(e) { console.error("Email failed"); }
    }

    res.status(201).json({ message: "Booking request sent!", booking: newBooking });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// --- START JOB ---
export const startJob = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.startOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Force Update to ensure persistence
    await Booking.findByIdAndUpdate(bookingId, { 
        status: "in_progress",
        startTime: new Date()
    });

    res.json({ message: "Job Started!", booking });
  } catch (err) {
    console.error("Start Job Error:", err);
    res.status(500).json({ message: "Error starting job" });
  }
};

// --- END JOB (Calculate Bill) ---
export const endJob = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "in_progress") {
        return res.status(400).json({ message: "Job is not in progress" });
    }
    if (!booking.startTime) {
        return res.status(400).json({ message: "Start time missing" });
    }

    // 1. Calculate Duration
    const endTime = new Date();
    const startTime = new Date(booking.startTime);
    const diffMs = endTime - startTime; 
    let hoursWorked = diffMs / (1000 * 60 * 60);

    // Minimum 1 Hour Charge
    if (hoursWorked < 1) hoursWorked = 1;

    // 2. Calculate Cost (Rate * Hours)
    // Use the rate saved in the booking, or fallback to 150
    const rate = booking.hourlyRate || 150; 
    const finalAmount = Math.ceil(hoursWorked * rate);

    // 3. Update Database
    booking.status = "completed";
    booking.endTime = endTime;
    booking.totalHours = parseFloat(hoursWorked.toFixed(2));
    booking.totalAmount = finalAmount;
    booking.paymentStatus = "pending"; 

    await booking.save();

    res.json({ 
        message: "Job Ended. Bill Generated.", 
        bill: { 
            hours: hoursWorked.toFixed(2), 
            rate: rate,
            amount: finalAmount 
        },
        booking 
    });

  } catch (err) {
    console.error("End Job Error:", err);
    res.status(500).json({ message: "Error ending job" });
  }
};

// --- CANCEL BOOKING ---
// backend/controllers/bookingController.js

export const cancelBooking = async (req, res) => {
  // 🛑 LOG 1: Entry Point
  console.log("🔥 HIT BACKEND: cancelBooking for ID:", req.params.id);

  try {
    const booking = await Booking.findById(req.params.id);
    
    // 🛑 LOG 2: Inspect the raw object from DB (Debugging User vs UserId)
    // This helps verify if your schema uses 'user' or 'userId' or if population happened
    console.log("📄 Full Booking Object:", JSON.stringify(booking, null, 2));

    if (!booking) {
        console.log("❌ Error: Booking ID not found in database.");
        return res.status(404).json({ message: "Booking Not Found" });
    }

    // 🛑 LOG 3: Data Integrity Safety Check
    // Handle cases where the schema might be inconsistent (user vs userId)
    const bookingOwnerId = booking.user || booking.userId; 

    if (!bookingOwnerId) {
        console.error("❌ CRITICAL DATA ERROR: Booking has no 'user' or 'userId' field!", booking);
        return res.status(500).json({ message: "Corrupt Booking Data: No Owner identified" });
    }

    // 🛑 LOG 4: Authorization Check
    console.log(`👮 Auth Check: Requesting User ${req.user._id} vs Owner ${bookingOwnerId}`);

    if (bookingOwnerId.toString() !== req.user._id.toString()) {
        console.log("⛔ Error: User not authorized to cancel this booking.");
        return res.status(403).json({ message: "Not Authorized" });
    }

    // 🛑 LOG 5: Time Logic (2-Hour Rule)
    const shiftStartHours = { "Morning": 8, "Full Day": 8, "Evening": 16 };
    // Default to 8 AM if shift is undefined or not in map
    const startHour = shiftStartHours[booking.shift] || 8; 
    
    const bookingStart = moment(booking.date).hour(startHour).minute(0).second(0);
    const deadline = bookingStart.clone().subtract(2, 'hours');

    console.log(`⏰ Time Check: Now (${moment().format()}) vs Deadline (${deadline.format()})`);

    if (moment().isAfter(deadline)) {
      console.log("⏳ Error: Too late to cancel.");
      return res.status(400).json({ message: "Too late to cancel (less than 2 hours left)" });
    }

    // 🛑 LOG 6: Execute Cancellation
    booking.status = "cancelled";
    await booking.save();
    
    console.log("✅ Booking successfully updated to 'cancelled'");
    res.json({ message: "Booking Cancelled Successfully" });

  } catch (err) {
    // 🛑 LOG 7: Catch-all error handler
    console.error("❌ BACKEND CRASH:", err);
    res.status(500).json({ message: err.message });
  }
};

// ... (Keep reportNoShow, getBusySlots, getUserBookings, getMaidRequests, updateBookingStatus EXACTLY as they were in your previous code) ...
// For brevity, I am not pasting them again, but DO NOT delete them.

// --- The Rest of your functions (reportNoShow, etc) go here ---
export const reportNoShow = async (req, res) => {
    // ... Paste your existing reportNoShow logic here ...
    // (It's fine as it is)
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
    
        if (!booking) return res.status(404).json({ message: "Booking not found" });
    
        // 1. Validation: Ensure date has passed
        const now = new Date();
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(23, 59, 59, 999); // End of the booking day
    
        if (now < bookingDate) {
             return res.status(400).json({ message: "You cannot report a No Show before the booking date is over." });
        }
    
        if (booking.status !== "accepted") {
            return res.status(400).json({ message: "Only accepted bookings can be reported as No Show." });
        }
    
        // 2. Update Status
        booking.status = "no_show";
        await booking.save();
    
        // 3. Add Strike to Maid
        const maid = await Maid.findById(booking.maidId);
        if (maid) {
            maid.strikes = (maid.strikes || 0) + 1;
            
            // 4. Suspend if 3 Strikes
            if (maid.strikes >= 3) {
                maid.status = "suspended"; // Auto-suspend
                maid.rejectionReason = "Account suspended due to 3 confirmed 'No Show' reports.";
            }
            await maid.save();
        }
    
        // 5. Notify Maid (Optional)
        await sendNotification(
            booking.maidId.toString(),
            "Strike Received ⚠️",
            "You missed a scheduled booking. You have received a strike.",
            "system"
        );
    
        res.json({ message: "No Show reported. Strike added to maid.", booking });
      } catch (err) {
        console.error("No Show Error:", err);
        res.status(500).json({ message: "Error reporting no show" });
      }
};

export const getBusySlots = async (req, res) => {
    // ... Paste your existing getBusySlots logic here ...
    try {
        const { maidId, date } = req.query;
    
        if (!maidId || !date) return res.status(400).json({ message: "Missing params" });
    
        // Find all active bookings for this maid on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
    
        const bookings = await Booking.find({
          maidId,
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["pending", "accepted"] } // Only active bookings block slots
        });
    
        // Extract all slots into a single flattened array
        // e.g. [["08:00", "09:00"], ["10:00"]] -> ["08:00", "09:00", "10:00"]
        const busySlots = bookings.flatMap(b => b.timeSlots);
    
        res.json(busySlots);
      } catch (err) {
        res.status(500).json({ message: "Error fetching slots" });
      }
};

export const getUserBookings = async (req, res) => {
    // ... Paste your existing getUserBookings logic here ...
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
    
        // 1. AUTO-EXPIRE: Update all pending bookings before today to 'expired'
        await Booking.updateMany(
          { 
            status: 'pending', 
            date: { $lt: today } 
          },
          { status: 'expired' }
        );
    
        // 2. Fetch bookings (now with updated statuses)
        const bookings = await Booking.find({ userId: req.user.id })
          .populate("maidId", "name phone photo serviceType")
          .populate("addressId")
          .sort({ createdAt: -1 });
    
        res.json(bookings);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching bookings" });
      }
};

export const getMaidRequests = async (req, res) => {
    // ... Paste your existing getMaidRequests logic here ...
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        /* ----------------------------------------
           1️⃣ Auto-expire OLD pending requests
        ---------------------------------------- */
        await Booking.updateMany(
          {
            maidId: req.user.id,
            status: "pending",
            date: { $lt: today }
          },
          { status: "expired" }
        );
    
        /* ----------------------------------------
           2️⃣ Fetch ALL bookings (Fix: Removed status filter)
        ---------------------------------------- */
        // WE REMOVED: status: { $in: [...] } so we get completed jobs too
        const bookings = await Booking.find({
          maidId: req.user.id
        })
          .populate("userId", "name email phone")
          .populate("addressId")
          .sort({ date: -1 }); // Sort newest first is usually better for history
    
        /* ----------------------------------------
           3️⃣ Categorize bookings
        ---------------------------------------- */
        const pending = [];
        const active = [];
        const overdue = [];
        const history = []; // <--- NEW ARRAY
    
        bookings.forEach(b => {
          const bookingDate = new Date(b.date);
          bookingDate.setHours(0, 0, 0, 0);
    
          // A. History: Completed, Rejected, Cancelled, Expired, No Show
          if (["completed", "rejected", "cancelled", "expired", "no_show"].includes(b.status)) {
            history.push(b);
          }
          
          // B. Pending (future only)
          else if (b.status === "pending" && bookingDate >= today) {
            pending.push(b);
          }
    
          // C. Active (Today or Future Accepted)
          // Note: I expanded this to include future accepted jobs so they don't disappear
          else if (["accepted", "in_progress"].includes(b.status)) {
             if (bookingDate < today) {
                 overdue.push(b); // Accepted but in the past = Overdue
             } else {
                 active.push(b);  // Accepted for today or future = Active
             }
          }
        });
    
        /* ----------------------------------------
           4️⃣ Return including history
        ---------------------------------------- */
        res.json({
          pending,
          active,
          overdue,
          history // <--- Send this to frontend
        });
    
      } catch (err) {
        console.error("Maid Requests Error:", err);
        res.status(500).json({ message: "Error fetching maid requests" });
      }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
    
        if (!["accepted", "rejected", "completed", "cancelled"].includes(status)) {
          return res.status(400).json({ message: "Invalid status update" });
        }
    
        // 🚨 CRITICAL CHANGE 1: We must find the booking FIRST and populate 'maidId'
        // We need the maid's 'hourlyRate' to calculate the bill.
        const booking = await Booking.findById(id).populate('maidId');

        if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
        }

        // --- LOGIC FOR COMPLETING A JOB ---
        if (status === "completed") {
            const endTime = new Date();
            const startTime = new Date(booking.startTime || booking.createdAt);

            // 1. Calculate Hours Worked (Round up, minimum 1 hour)
            const diffMs = endTime - startTime;
            const hoursWorked = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

            // 2. Get Rate (Fallback to 200 if missing)
            const rate = booking.maidId.hourlyRate || 200;

            // 3. Set Values to the Booking Object
            booking.endTime = endTime;
            booking.totalAmount = hoursWorked * rate; // <--- THIS FIXES "PAY ₹0"

            // 4. Update Maid's Profile (Increment Job Count)
            // This runs a separate database command to add +1 to their count
            await Maid.findByIdAndUpdate(booking.maidId._id, { 
                $inc: { completedJobs: 1 } 
            }); // <--- THIS FIXES "0 Jobs"
        }

        // Apply the status update
        booking.status = status;
        
        // Save the changes to the database
        const updatedBooking = await booking.save();
    
        // --- NOTIFICATION LOGIC ---
        try {
            // If Maid accepted, notify User
            if (status === "accepted") {
              await sendNotification(
                updatedBooking.userId.toString(), 
                "Booking Accepted", 
                "Your maid has accepted the job request!", 
                "booking"
              );
            }
        
            // If Maid completed, notify User
            if (status === "completed") {
              await sendNotification(
                updatedBooking.userId.toString(), 
                "Job Completed", 
                "Please rate your service experience.", 
                "booking"
              );
            }
        } catch (notifError) {
            console.error("Notification failed but booking updated:", notifError);
        }
        
        res.json({ message: `Booking ${status}`, booking: updatedBooking });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Failed to update status" });
    }
};

// --- HELPER FUNCTION FOR TIME CHECK ---
const checkModificationDeadline = (booking) => {
  // Define broad shift start times
  const shiftStartHours = {
    "Morning": 8,   // 8:00 AM
    "Full Day": 8,  // 8:00 AM
    "Evening": 16   // 4:00 PM
  };

  // Determine start hour based on shift or default to 8 AM
  // If your DB uses 'timeSlots' array, you might want to default to 'Morning' logic or parse the string
  let startHour = 8;
  if (booking.shift && shiftStartHours[booking.shift]) {
    startHour = shiftStartHours[booking.shift];
  } else if (booking.timeSlots && booking.timeSlots[0]) {
    // Optional: Parse "10:00 AM" if needed, but broad 'Morning' rule is safer/easier
    // For now, defaulting to 8 AM covers most morning slots safely
    startHour = 8; 
  }

  // Combine booking Date + Start Hour
  const bookingStart = moment(booking.date).hour(startHour).minute(0).second(0);
  
  // Calculate Deadline: 2 hours BEFORE start
  const deadline = bookingStart.clone().subtract(2, 'hours');

  // Check if NOW is AFTER the deadline
  if (moment().isAfter(deadline)) {
    return { 
      allowed: false, 
      message: "Modifications are locked less than 2 hours before the start time." 
    };
  }

  return { allowed: true };
};

export const rescheduleBooking = async (req, res) => {
  try {
    // 🛑 FIX 1: Use bookingId to match your route
    const { bookingId } = req.params; 
    const { date } = req.body; // Expecting "2026-02-25"
    
    if (!date) return res.status(400).json({ message: "New date is required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking Not Found" });

    // 🛑 FIX 2: Use booking.userId instead of booking.user
    if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not Authorized" });
    }

    // 🛑 FIX 3: Use booking.timeSlot (or whatever your DB uses) instead of shift
    const shiftStartHours = { "Morning": 8, "Full Day": 8, "Evening": 16 };
    const startHour = shiftStartHours[booking.timeSlot] || 8; 
    
    // 2-Hour Rule Logic
    const bookingStart = moment(booking.date).hour(startHour).minute(0);
    const deadline = bookingStart.clone().subtract(2, 'hours');

    if (moment().isAfter(deadline)) {
      return res.status(400).json({ message: "Too late to reschedule. Must be done 2 hours prior." });
    }

    booking.date = date;
    booking.status = "pending"; // Reset to pending so maid sees it as new
    await booking.save();
    
    res.json({ message: "Rescheduled Successfully" });

  } catch (err) {
    console.error("❌ Reschedule Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};