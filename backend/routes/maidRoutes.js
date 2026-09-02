import express from "express";
import { 
  registerMaid, 
  maidLogin, 
  getMaidProfile, 
  updateMaidProfile,
  getAllMaids,
  approveMaid,
  getPendingMaids,
  getApprovedMaids,
  getRejectedMaids,
  getRemovedMaids,
  removeMaid,
  getNearbyMaids,
  updateLocation
} from "../controllers/maidController.js";
import { authMiddleware, verifyToken, requireAdmin } from "../middleware/authMiddleware.js"; 
import upload from "../middleware/upload.js"; // Ensure this path is correct

const router = express.Router();

// ==========================================
//  DEBUG REGISTER ROUTE
// ==========================================
// We wrap this route to catch specific Multer errors
router.post("/register", (req, res, next) => {
    // 1. Define the Uploader
    const uploader = upload.fields([
        { name: 'photo', maxCount: 1 }, 
        { name: 'documents', maxCount: 5 }
    ]);

    // 2. Run the Uploader Manually
    uploader(req, res, (err) => {
        if (err) {
            // 🛑 THIS PRINTS THE REAL ERROR TO YOUR TERMINAL
            console.error("❌ MULTER/CLOUDINARY ERROR:", err);
            
            // Return detailed error to frontend
            return res.status(400).json({ 
                message: "Upload Error", 
                detail: err.message,
                code: err.code 
            });
        }
        
        // If successful, check if files actually exist
        console.log("✅ Multer Success! Files received:", req.files ? Object.keys(req.files) : "None");
        console.log("✅ Body received:", req.body);
        
        // Pass control to the controller
        next();
    });
}, registerMaid);


// ==========================================
//  OTHER ROUTES
// ==========================================
router.post("/login", maidLogin);
router.get("/approved", getApprovedMaids);
router.get("/nearby", getNearbyMaids);
router.get("/", getAllMaids);

// Protected
router.get("/me", authMiddleware("maid"), getMaidProfile);
router.put("/update", authMiddleware("maid"), updateMaidProfile);
router.put("/update-location", authMiddleware("maid"), updateLocation);

// Admin
router.get("/pending", verifyToken, requireAdmin, getPendingMaids);
router.get("/rejected", verifyToken, requireAdmin, getRejectedMaids);
router.get("/removed", verifyToken, requireAdmin, getRemovedMaids);
router.put("/approve/:id", verifyToken, requireAdmin, approveMaid);
router.put("/remove/:id", verifyToken, requireAdmin, removeMaid);

export default router;