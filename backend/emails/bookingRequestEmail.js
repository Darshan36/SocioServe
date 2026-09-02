export const bookingRequestEmail = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #F59E0B; padding: 20px; text-align: center; color: white; }
    .content { padding: 20px; background-color: #fff; color: #333; }
    .details-box { background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B; }
    .button { display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Job Opportunity! 🧹</h2>
    </div>
    
    <div class="content">
      <p>Hello <strong>${data.maidName}</strong>,</p>
      <p>You have received a new booking request from a resident.</p>

      <div class="details-box">
        <p><strong>👤 Resident:</strong> ${data.userName}</p>
        <p><strong>💼 Service:</strong> ${data.serviceType}</p>
        <p><strong>📅 Date:</strong> ${new Date(data.date).toDateString()}</p>
        <p><strong>⏰ Time:</strong> ${data.timeSlot}</p>
        <p><strong>📍 Address:</strong> ${data.address}</p>
        ${data.notes ? `<p><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
      </div>

      <p>Please login to your dashboard to <strong>Accept</strong> or <strong>Reject</strong> this request.</p>

      <div style="text-align: center;">
        <a href="http://localhost:5173/maid-login" class="button">Go to Dashboard</a>
      </div>
    </div>
    
    <div class="footer">
      © ${new Date().getFullYear()} SocioServe. All rights reserved.
    </div>
  </div>
</body>
</html>
`;