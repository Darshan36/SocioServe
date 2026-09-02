import express from "express";
import {
  saveAddress,
  getMyAddresses,
} from "../controllers/addressController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save new address
router.post("/", verifyToken, saveAddress);

// Get logged-in user's addresses
router.get("/", verifyToken, getMyAddresses);

export default router;
