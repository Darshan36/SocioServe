import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// 1. LOAD LIBRARIES
const cloudinary = require("cloudinary");
const storageLib = require("multer-storage-cloudinary");

// 🔍 DEBUG: Print the library structure so we know for sure
console.log("DEBUG: Storage Lib Keys:", Object.keys(storageLib));
if (storageLib.default) console.log("DEBUG: Storage Lib Default Keys:", Object.keys(storageLib.default));

// 🛑 2. DYNAMICALLY FIND THE CONSTRUCTOR
// It's either directly on the export OR inside .default
const CloudinaryStorage = storageLib.CloudinaryStorage || storageLib.default?.CloudinaryStorage || storageLib.default || storageLib;

// Safety Check
if (typeof CloudinaryStorage !== 'function') {
    console.error("❌ CRITICAL FAIL: Could not find CloudinaryStorage constructor.");
    process.exit(1); 
}

// 3. CONFIGURE CLOUDINARY
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 4. CREATE STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Use the root cloudinary object
  params: {
    folder: "socioserve_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

export default multer({ storage });