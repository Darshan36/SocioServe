import express from "express";
import { getDashboardStats, getBannedMaids,getAllBookings } from "../controllers/adminController.js";
// 🛑 FIX: Import verifyToken instead of authMiddleware
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🛑 FIX: Use verifyToken. This correctly loads the user, then requireAdmin checks the role.
router.use(verifyToken, requireAdmin); 

router.get("/stats", getDashboardStats);
router.get("/banned-maids", getBannedMaids);
router.get("/bookings", getAllBookings);

export default router;