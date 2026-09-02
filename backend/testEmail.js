import { sendApprovalMail } from "./config/email.js";

console.log("Testing email...");
console.log("ENV EMAIL =", process.env.GMAIL_EMAIL);
console.log("ENV PASS =", process.env.GMAIL_APP_PASSWORD);

(async () => {
  try {
    await sendApprovalMail("darshan.somaiya369@gmail.com", {
      name: "Test Maid",
      phone: "9999999999",
      serviceType: "Cleaner"
    });

    console.log("✔ Test email sent!");
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
  }
})();
