import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import path from "path"; // ✅ 1. Import path
import { fileURLToPath } from "url"; // Already here

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import maidRoutes from "./routes/maidRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import helpdeskRoutes from "./routes/helpdeskRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// ✅ 2. Define __dirname (Required for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use((req, res, next) => {
  console.log(`📡 RECEIVED REQUEST: ${req.method} ${req.url}`);
  next();
});

// 🛑 REPLACE THE CORS BLOCK WITH THIS:
app.use(cors({
  origin: "http://localhost:5173", // Your exact Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Crucial for tokens/cookies
}));

app.use(express.json());
app.use(morgan("dev"));



// ✅ 3. CRITICAL FIX: Serve the 'uploads' folder as static files
// This tells Express: "If a request starts with /uploads, look in the folder named 'uploads'"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// API Routes
app.use("/api/addresses", addressRoutes);
app.use("/api/maids", maidRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/helpdesk", helpdeskRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("SocioServe API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Debug Logs (Optional)
// console.log("Cloudinary:", process.env.CLOUDINARY_NAME); 
// console.log("EMAIL:", process.env.GMAIL_EMAIL);