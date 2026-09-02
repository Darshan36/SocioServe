import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Maid from "../models/Maid.js"; // 🛑 MAKE SURE THIS PATH IS CORRECT

/**
 * ✅ 1. verifyToken (General Access)
 * Checks both User AND Maid collections.
 * Use this for shared routes like cancel/reschedule.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🛑 1. Try finding in User collection
    let account = await User.findById(decoded.id).select("-password");
    
    // 🛑 2. If not found, try Maid collection
    if (!account) {
        account = await Maid.findById(decoded.id).select("-password");
    }

    if (!account) {
        return res.status(401).json({ message: "Account not found" });
    }

    req.user = account; // Attach the found account (User or Maid)
    next();

  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * 🔒 2. authMiddleware (Role Specific)
 * Used for specific routes: authMiddleware("maid") or authMiddleware("user")
 */
export const authMiddleware = (role) => {
  return async (req, res, next) => {
    const header = req.headers.authorization || req.headers.Authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (role && decoded.role !== role) {
        return res.status(403).json({ message: "Forbidden: Access Denied" });
      }

      let account = null;

      // 🛑 OPTIMIZED LOOKUP BASED ON ROLE
      if (role === "maid") {
          account = await Maid.findById(decoded.id).select("-password");
      } else if (role === "user") {
          account = await User.findById(decoded.id).select("-password");
      } else {
          // If no role specified or "admin", try both
          account = await User.findById(decoded.id).select("-password");
          if (!account) account = await Maid.findById(decoded.id).select("-password");
      }
      
      if (!account) {
         return res.status(401).json({ message: "User not found" });
      }

      req.user = account;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

/**
 * 👑 3. requireAdmin
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};