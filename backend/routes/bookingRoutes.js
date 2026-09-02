import express from "express";

// 🛑 1. IMPORT verifyToken (and authMiddleware if you still use it for other routes)
import { verifyToken, authMiddleware } from "../middleware/authMiddleware.js";

import { 
  createBooking, 
  getUserBookings, 
  getMaidRequests,
  getBusySlots,
  updateBookingStatus,
  reportNoShow,
  cancelBooking,
  rescheduleBooking,
  startJob,
  endJob 
} from "../controllers/bookingController.js";

const router = express.Router();

// ==========================================
//  USER ROUTES
// ==========================================

// ✅ Correct: Using the factory with a role
router.post("/create", authMiddleware("user"), createBooking);
router.get("/my-bookings", authMiddleware("user"), getUserBookings);
router.get("/slots", getBusySlots);
router.put("/report-no-show/:id", authMiddleware("user"), reportNoShow);

// ==========================================
//  MAID ROUTES
// ==========================================

router.get("/maid-requests", authMiddleware("maid"), getMaidRequests);
router.put("/status/:id", authMiddleware("maid"), updateBookingStatus);
router.put("/start-job", authMiddleware("maid"), startJob);
router.put("/end-job", authMiddleware("maid"), endJob);

// ==========================================
//  SHARED / GENERAL ROUTES (The Ones That Were Broken)
// ==========================================

// 🛑 2. FIX: Use 'verifyToken' here. 
// This allows ANY logged-in user (User OR Maid) to access these routes 
// (Your controller logic handles the specific permission checks).
router.put("/cancel/:id", verifyToken, cancelBooking);
router.put("/reschedule/:bookingId", verifyToken, rescheduleBooking);

export default router;