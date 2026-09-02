import express from "express";
import { 
  createOrder, 
  verifyPayment, 
  getTransactionHistory,
  processRefund 
} from "../controllers/paymentController.js";

// 🛑 Import 'verifyToken' alongside 'authMiddleware'
import { authMiddleware, verifyToken, requireAdmin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// 1. Create Order: Only 'Users' (Residents) pay, so keep this restricted.
router.post("/create-order", authMiddleware("user"), createOrder);

// 2. Verify: Usually done by the user who paid.
router.post("/verify", authMiddleware("user"), verifyPayment);
router.post("/refund", verifyToken, requireAdmin, processRefund);

// 🛑 3. History: CHANGED to 'verifyToken'
// This allows BOTH Maids and Users to see their transaction lists.
router.get("/history", verifyToken, getTransactionHistory);

export default router;