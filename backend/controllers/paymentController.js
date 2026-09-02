import Booking from "../models/Booking.js";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const ENV = "SANDBOX"; // Change to "PRODUCTION" when live

// Select URL based on Environment
const BASE_URL = (ENV === "PRODUCTION") 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg";

// ==========================================
// 1. CREATE ORDER (Initiate Payment)
// ==========================================
export const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log(`Processing Payment for Booking ID: ${bookingId}`);

    const booking = await Booking.findById(bookingId).populate("userId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Amount Check
    let finalAmount = booking.totalAmount;
    if (!finalAmount || finalAmount <= 0) {
        console.log("Amount is 0. Defaulting to ₹1 for testing.");
        finalAmount = 1; 
    }

    // Prepare Data
    const orderId = `ORDER_${booking._id}_${Date.now()}`; 
    const payload = {
      order_amount: finalAmount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: booking.userId._id.toString(),
        customer_phone: (booking.userId.phone && booking.userId.phone.length >= 10) 
                        ? booking.userId.phone 
                        : "9999999999",
        customer_name: booking.userId.name || "Guest",
        customer_email: booking.userId.email || "guest@example.com"
      },
      order_meta: {
        return_url: `http://localhost:5173/payment-success?order_id={order_id}` 
      }
    };

    // Call Cashfree API
    const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": APP_ID,
            "x-client-secret": SECRET_KEY
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Cashfree API Error:", data);
        return res.status(response.status).json({ message: data.message || "Payment init failed" });
    }
    
    // Save Order ID to Booking
    booking.transactionId = orderId;
    await booking.save();

    res.json(data); 

  } catch (error) {
    console.error("Payment Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// 2. VERIFY PAYMENT (Callback)
// ==========================================
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Call Cashfree to check status
    const response = await fetch(`${BASE_URL}/orders/${orderId}/payments`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": APP_ID,
            "x-client-secret": SECRET_KEY
        }
    });

    const data = await response.json();

    // Check if any transaction is "SUCCESS"
    const validTransaction = Array.isArray(data) && data.find(t => t.payment_status === "SUCCESS");

    if (validTransaction) {
        const booking = await Booking.findOne({ transactionId: orderId });
        if(booking) {
            booking.paymentStatus = "paid";
            await booking.save();
            return res.json({ status: "success", message: "Payment Verified" });
        }
    }
    
    res.status(400).json({ status: "failed", message: "Payment Verification Failed" });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Verification Error" });
  }
};

// ==========================================
// 3. GET TRANSACTION HISTORY (Fixed)
// ==========================================
export const getTransactionHistory = async (req, res) => {
  try {
    // 1. Safety Check: Did middleware attach the user?
    if (!req.user) {
        console.error("❌ History Error: req.user is missing. Check verifyToken middleware.");
        return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    console.log(`💰 Fetching History for User ID: ${req.user._id} | Role: ${req.user.role}`);

    // 2. Build Query
    // We only want 'paid' bookings
    let query = { paymentStatus: "paid" };

    // 3. Determine Role Logic
    // If explicit role is 'maid' OR if the user object has maid-specific fields (like serviceType)
    if (req.user.role === "maid" || req.user.serviceType) {
        query.maidId = req.user._id; // Filter where THIS maid did the work
    } 
    // Otherwise assume it's a regular user (Resident)
    else {
        query.userId = req.user._id; // Filter where THIS user paid
    }

    // 4. Fetch & Populate
    const transactions = await Booking.find(query)
        .populate("userId", "name email phone") // Show who paid
        .populate("maidId", "name email phone") // Show who did the work
        .sort({ updatedAt: -1 }); // Newest first

    res.json(transactions);

  } catch (error) {
    console.error("❌ History Error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

// ... existing imports and config

// ==========================================
// 4. PROCESS REFUND (Admin Only)
// ==========================================
// backend/controllers/paymentController.js

// backend/controllers/paymentController.js

// backend/controllers/paymentController.js

// backend/controllers/paymentController.js

export const processRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const orderId = booking.transactionId;
    console.log(`\n🔍 --- REFUND CHECK FOR: ${orderId} ---`);

    // 1. FETCH PAYMENTS
    const paymentRes = await fetch(`${BASE_URL}/orders/${orderId}/payments`, {
        headers: { "x-api-version": "2023-08-01", "x-client-id": APP_ID, "x-client-secret": SECRET_KEY }
    });
    const payments = await paymentRes.json();
    
    let totalPaid = 0;
    if (Array.isArray(payments)) {
        payments.forEach(p => { if (p.payment_status === "SUCCESS") totalPaid += parseFloat(p.payment_amount); });
    }

    // 2. FETCH REFUNDS
    const refundRes = await fetch(`${BASE_URL}/orders/${orderId}/refunds`, {
        headers: { "x-api-version": "2023-08-01", "x-client-id": APP_ID, "x-client-secret": SECRET_KEY }
    });
    const refundData = await refundRes.json();
    
    // 🛑 CREATE FLAT LIST (Handle both Array and Object structures)
    let allRefunds = [];
    if (Array.isArray(refundData)) {
        allRefunds = refundData;
    } else if (refundData && Array.isArray(refundData.refunds)) {
        allRefunds = refundData.refunds;
    }

    // 🛑 SUM UP REFUNDS
    let alreadyRefunded = 0;
    allRefunds.forEach(r => {
        if (["SUCCESS", "PENDING", "ONHOLD"].includes(r.refund_status)) {
            alreadyRefunded += parseFloat(r.refund_amount);
        }
    });

    const remainingBalance = parseFloat((totalPaid - alreadyRefunded).toFixed(2));
    const requestedAmount = parseFloat(amount);

    console.log(`💰 BALANCE: Paid ${totalPaid} | Refunded ${alreadyRefunded} | Left ${remainingBalance}`);

    // 3. THE "AUTO-CORRECT" BLOCK
    if (remainingBalance < requestedAmount) {
         if (alreadyRefunded > 0) {
             
             // 🛑🛑 THIS IS THE FIX 🛑🛑
             // Check if ANY refund in the list is ONHOLD
             const isOnHold = allRefunds.some(r => r.refund_status === "ONHOLD");

             console.log(`⚠️ DETECTED STATUS: ${isOnHold ? "ON HOLD (Orange)" : "PROCESSED (Purple)"}`);

             // Save the specific status
             booking.paymentStatus = isOnHold ? "refund_on_hold" : "refunded";
             booking.refundAmount = alreadyRefunded;
             
             if (!booking.adminNotes?.includes("System Update")) {
                 booking.adminNotes = (booking.adminNotes || "") + ` [System: Found existing refund (${isOnHold ? "ON HOLD" : "SUCCESS"})]`;
             }
             
             await booking.save();

             return res.status(400).json({ 
                message: `Refund is ${isOnHold ? "ON HOLD" : "ALREADY PROCESSED"}. Database updated.` 
            });
         }
         
         return res.status(400).json({ 
            message: `Cannot refund ₹${requestedAmount}. Balance is ₹${remainingBalance}.` 
        });
    }

    // 4. NEW REFUND EXECUTION (If valid)
    const refundId = `REF_${booking._id}_${Date.now()}`;
    const payload = {
        refund_amount: requestedAmount,
        refund_id: refundId,
        refund_note: reason || "Admin Refund"
    };

    const response = await fetch(`${BASE_URL}/orders/${orderId}/refunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-version": "2023-08-01", "x-client-id": APP_ID, "x-client-secret": SECRET_KEY },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("❌ FAILURE:", data);
        return res.status(400).json({ message: data.message || "Refund Rejected" });
    }

    // Success
    booking.paymentStatus = "refunded";
    booking.refundId = data.cf_refund_id || refundId;
    booking.refundAmount = (booking.refundAmount || 0) + requestedAmount;
    booking.refundDate = new Date();
    booking.adminNotes = reason;
    if (booking.isDisputed) {
        booking.isDisputed = false;
        booking.disputeReason += " [RESOLVED]";
    }

    await booking.save();
    res.json({ message: "Refund Processed", refundId: booking.refundId });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};  