import dotenv from "dotenv";
dotenv.config();   // <--- FORCE LOAD .env AT THE VERY TOP

import nodemailer from "nodemailer";
import { approvalEmail } from "../emails/approvalEmail.js";
import { rejectionEmail } from "../emails/rejectionEmail.js";
import { adminNotifyEmail } from "../emails/adminNotifyEmail.js";
import { bookingRequestEmail } from "../emails/bookingRequestEmail.js";


// --------------------------------------------------
//  VERIFY ENVIRONMENT VARIABLES
// --------------------------------------------------
if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
  console.error("❌ ERROR: Missing Gmail environment variables");
  console.error("Make sure your .env contains:");
  console.error("GMAIL_EMAIL=your@gmail.com");
  console.error("GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx\n");
  process.exit(1);
}

// --------------------------------------------------
//  CREATE TRANSPORTER (CORRECT SMTP FOR APP PASSWORDS)
// --------------------------------------------------
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // required for Gmail + App Password
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter connected & ready!");
  }
});

// --------------------------------------------------
//  BASE EMAIL SENDER FUNCTION
// --------------------------------------------------
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SocioServe" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    throw err;
  }
};

// --------------------------------------------------
//  SEND APPROVAL EMAIL
// --------------------------------------------------
export const sendApprovalMail = (to, data) =>
  sendEmail(to, "Your SocioServe Verification is Approved", approvalEmail(data));

// --------------------------------------------------
//  SEND REJECTION EMAIL
// --------------------------------------------------
export const sendRejectionMail = (to, data) =>
  sendEmail(to, "SocioServe Verification Update", rejectionEmail(data));

// --------------------------------------------------
//  SEND ADMIN NOTIFICATION
// --------------------------------------------------
export const notifyAdmin = (data) =>
  sendEmail(
    process.env.GMAIL_EMAIL,
    "New Maid Registration Submitted",
    adminNotifyEmail(data)
  );

// --------------------------------------------------
//  2. NEW: SEND BOOKING REQUEST EMAIL
// --------------------------------------------------
export const sendBookingRequestMail = (to, data) => 
  sendEmail(
    to, 
    `New Job Request: ${data.serviceType}`, 
    bookingRequestEmail(data)
  );
