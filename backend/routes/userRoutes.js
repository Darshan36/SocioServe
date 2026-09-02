import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
  getUserProfile, 
  updateUserProfile,       // <--- Add this
} from '../controllers/userController.js';

const router = express.Router();

// Protected Routes (User must be logged in)
router.get("/me", authMiddleware("user"), getUserProfile);
router.put("/update", authMiddleware("user"), updateUserProfile);

export default router;