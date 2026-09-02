// controllers/maidController.js

import Maid from "../models/Maid.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendApprovalMail,
  sendRejectionMail,
  notifyAdmin,
} from "../config/email.js";
import { buildLocation } from "../utils/location.js";

/* ---------------------------------------------
   GET NEARBY MAIDS (Updated with Completed Jobs Count)
--------------------------------------------- */
export const getNearbyMaids = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) return res.status(400).json({ message: "Location required" });

    const maids = await Maid.aggregate([
      { $match: { status: "approved" } },

      // 1. Lookup Reviews (For Rating)
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "maidId",
          as: "reviews"
        }
      },

      // 2. Lookup Bookings (For Completed Jobs Count)
      {
        $lookup: {
          from: "bookings", // Ensure your MongoDB collection is named 'bookings'
          let: { maidId: "$_id" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ["$maidId", "$$maidId"] },
                    { $eq: ["$status", "completed"] } // Only count completed jobs
                  ]
                }
              } 
            }
          ],
          as: "completedBookings"
        }
      },

      // 3. Calculate Fields
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          reviewCount: { $size: "$reviews" },
          completedJobs: { $size: "$completedBookings" } // <--- THE NEW FIELD
        }
      },

      { $project: { reviews: 0, completedBookings: 0, password: 0 } }
    ]);

    // --- Distance Logic (Unchanged) ---
    const toRad = (v) => (v * Math.PI) / 180;
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; 
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const result = maids.map((m) => {
      const coords = m.location?.coordinates || [0, 0];
      const distance = calculateDistance(parseFloat(lat), parseFloat(lng), coords[1], coords[0]);
      return { ...m, distance };
    });

    result.sort((a, b) => a.distance - b.distance);
    res.json(result);

  } catch (err) {
    console.error("NEARBY ERROR:", err);
    res.status(500).json({ message: "Error loading nearby maids" });
  }
};

/* ---------------------------------------------
   GET APPROVED MAIDS (Updated with Completed Jobs Count)
--------------------------------------------- */
export const getApprovedMaids = async (req, res) => {
  try {
    const maids = await Maid.aggregate([
      { $match: { status: "approved" } },
      
      // 1. Lookup Reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "maidId",
          as: "reviews"
        }
      },

      // 2. Lookup Bookings
      {
        $lookup: {
          from: "bookings",
          let: { maidId: "$_id" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ["$maidId", "$$maidId"] },
                    { $eq: ["$status", "completed"] }
                  ]
                }
              } 
            }
          ],
          as: "completedBookings"
        }
      },
      
      // 3. Calculate Stats
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          reviewCount: { $size: "$reviews" },
          completedJobs: { $size: "$completedBookings" } // <--- THE NEW FIELD
        }
      },
      
      { $project: { reviews: 0, completedBookings: 0, password: 0 } }
    ]);

    res.json(maids);
  } catch (err) {
    res.status(500).json({ message: "Error fetching maids" });
  }
};
// Add this aggregation logic to get stars


export const getMaidProfile = async (req, res) => {
  try {
    const maid = await Maid.findById(req.user.id).select("-password");
    if (!maid) return res.status(404).json({ message: "Profile not found" });
    res.json(maid);
  } catch (err) {
    res.status(500).json({ message: "Error loading profile" });
  }
};


/* ---------------------------------------------
   PENDING MAIDS
--------------------------------------------- */
export const getPendingMaids = async (req, res) => {
  try {
    const list = await Maid.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending maids" });
  }
};

export const updateMaidProfile = async (req, res) => {
  try {
    const { name, phone, serviceType, availability } = req.body;

    const maid = await Maid.findById(req.user.id);
    if (!maid) return res.status(404).json({ message: "Maid not found" });

    if (name) maid.name = name;
    if (phone) maid.phone = phone;
    if (serviceType) maid.serviceType = serviceType; 
    if (availability) maid.availability = availability; 
    
    await maid.save();
    
    res.json({ message: "Profile updated successfully", maid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ---------------------------------------------
   APPROVE MAID
--------------------------------------------- */
export const approveMaid = async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id);

    if (!maid) return res.status(404).json({ message: "Maid not found" });

    maid.status = "approved";
    await maid.save();

    await sendApprovalMail(maid.email, {
      name: maid.name,
      phone: maid.phone,
      serviceType: maid.serviceType,
    });

    res.json({ message: "Maid approved successfully" });
  } catch (err) {
    console.error("Approve Error:", err);
    res.status(500).json({ message: "Error approving maid" });
  }
};

/* ---------------------------------------------
   REJECT MAID
--------------------------------------------- */
export const rejectVerification = async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id);
    const { reason } = req.body;

    if (!maid) return res.status(404).json({ message: "Maid not found" });
    if (!reason) return res.status(400).json({ message: "Reason required" });

    maid.status = "rejected";
    maid.rejectionReason = reason;
    await maid.save();

    await sendRejectionMail(maid.email, { name: maid.name, reason });

    res.json({ message: "Maid rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting maid" });
  }
};

/* ---------------------------------------------
   REMOVED MAIDS
--------------------------------------------- */
export const removeMaid = async (req, res) => {
  try {
    await Maid.findByIdAndUpdate(req.params.id, { status: "removed" });
    res.json({ message: "Maid removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove maid" });
  }
};

export const getRejectedMaids = async (req, res) => {
  try {
    const list = await Maid.find({ status: "rejected" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error loading rejected maids" });
  }
};

export const getRemovedMaids = async (req, res) => {
  try {
    const list = await Maid.find({ status: "removed" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error loading removed maids" });
  }
};

/* ---------------------------------------------
   MAID LOGIN (Allows pending maids too)
--------------------------------------------- */
// MAID LOGIN
export const maidLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const maid = await Maid.findOne({ email }).select('+password');

    if (!maid) return res.status(404).json({ message: "Maid not found" });

    const isMatch = await bcrypt.compare(password, maid.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: maid._id, role: 'maid' }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};




/* ---------------------------------------------
   MAID REGISTRATION
--------------------------------------------- */
export const registerMaid = async (req, res) => {
  try {
    console.log("🔥 REGISTER CONTROLLER HIT");

    // 🛑 DEBUG: Log the entire file object to see what Cloudinary gave us
    if (req.files && req.files['photo']) {
        console.log("📸 Photo Object:", JSON.stringify(req.files['photo'][0], null, 2));
    } else {
        console.log("⚠️ No Photo Object found in Controller!");
    }

    // 1. EXTRACT DATA
    const { 
        name, email, password, phone, gender,
        serviceType, availability, 
        latitude, longitude, detectedAadhaar 
    } = req.body;

    // 2. CHECK EXISTING
    const existingMaid = await Maid.findOne({ email });
    if (existingMaid) {
        return res.status(400).json({ message: "Email already registered" });
    }

    // 3. PARSE ARRAYS
    const serviceArray = serviceType ? serviceType.split(",") : [];
    const availabilityArray = availability ? availability.split(",") : [];

    // 4. PARSE LOCATION
    let locationData = undefined;
    if (latitude && longitude) {
        locationData = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)] 
        };
    }

    // 5. GET FILE PATHS (The Robust Fix)
    const photoFile = req.files?.['photo']?.[0];
    
    // 🛑 TRY ALL POSSIBLE PROPERTIES FOR THE URL
    const photoUrl = photoFile?.path || photoFile?.secure_url || photoFile?.url || "";

    const docUrls = req.files?.['documents'] 
        ? req.files['documents'].map(f => f.path || f.secure_url || f.url) 
        : [];

    console.log("🔗 Final Photo URL:", photoUrl); // Debug log

    if (!photoUrl) {
        return res.status(400).json({ 
            message: "Profile Photo is required", 
            debug: "Photo file detected but no URL found. Check server logs." 
        });
    }

    // 6. SAVE TO DB
    const newMaid = new Maid({
        name,
        email,
        phone,
        password, 
        gender,
        serviceType: serviceArray,
        availability: availabilityArray,
        aadhaar: detectedAadhaar || "",
        location: locationData,
        photo: photoUrl,
        documents: docUrls,
        status: "pending",
        isVerified: false
    });

    await newMaid.save();
    console.log("✅ Maid Saved Successfully:", newMaid.email);

    res.status(201).json({ message: "Registration Successful", maid: newMaid });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(400).json({ message: "Registration Failed", error: error.message });
  }
};

/* ---------------------------------------------
   GET ALL MAIDS
--------------------------------------------- */
export const getAllMaids = async (req, res) => {
  try {
    const maids = await Maid.find().sort({ createdAt: -1 });
    res.json(maids);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch maids" });
  }
};

// Update Maid's Current Location
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Coordinates are required" });
    }

    const maid = await Maid.findById(req.user.id);
    if (!maid) return res.status(404).json({ message: "Maid not found" });

    // Update GeoJSON location
    // IMPORTANT: MongoDB uses [Longitude, Latitude] order
    maid.location = {
      type: "Point",
      coordinates: [longitude, latitude] 
    };

    await maid.save();

    res.json({ message: "Location updated successfully", location: maid.location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};