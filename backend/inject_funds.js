// backend/inject_funds.js
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config(); 

// 🛑 VERIFY THESE MATCH YOUR .ENV KEYS
const APP_ID = process.env.CASHFREE_APP_ID; 
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY; 

const BASE_URL = "https://sandbox.cashfree.com/pg";

async function addFunds() {
    try {
        const linkId = `FUND_INJECT_${Date.now()}`;
        console.log("🚀 Creating Fund Injection Link:", linkId);

        // 🛑 We use the '/links' endpoint to get a clickable URL
        const payload = {
            link_id: linkId,
            link_amount: 5000,
            link_currency: "INR",
            link_purpose: "Add Sandbox Funds",
            customer_details: {
                customer_phone: "9999999999",
                customer_email: "admin@socioserve.com",
                customer_name: "Admin Fund Injector"
            },
            link_meta: {
                return_url: "https://www.google.com" // Where to go after payment
            }
        };

        const res = await axios.post(`${BASE_URL}/links`, payload, {
            headers: {
                "x-client-id": APP_ID,
                "x-client-secret": SECRET_KEY,
                "x-api-version": "2023-08-01"
            }
        });

        console.log("\n✅ LINK GENERATED SUCCESSFULLY!");
        console.log("---------------------------------------------------");
        console.log("👉 CLICK THIS TO ADD FUNDS:");
        console.log(res.data.link_url); // <--- This will be the actual URL
        console.log("---------------------------------------------------");

    } catch (err) {
        console.error("❌ Error:", err.response ? err.response.data : err.message);
    }
}

addFunds();