import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addReview, getMaidReviews } from "../controllers/reviewController.js";

const router = express.Router();

// POST /api/reviews/add (Protected: User only)
router.post("/add", authMiddleware("user"), addReview);

// GET /api/reviews/:maidId (Public or Protected)
// Anyone can read reviews
router.get("/:maidId", getMaidReviews);

export default router;