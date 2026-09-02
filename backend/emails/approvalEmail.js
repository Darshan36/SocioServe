// backend/emails/approvalEmail.js
export const approvalEmail = ({ name, phone, serviceType }) => `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#f6f9fb;padding:30px 0;">
  <tr>
    <td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#0f172a;">SocioServe</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:28px;">

            <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a;">
              Congratulations, ${name}!
            </h1>

            <p style="margin:0 0 16px;color:#374151;line-height:1.6;">
              Your verification has been <strong style="color:#16a34a;">approved</strong>.
              You are now listed for the society and residents may contact you for work.
            </p>

            <p style="margin:0 0 12px;color:#374151;">
              <strong>Your Details:</strong><br>
              Service: ${serviceType}<br>
              Phone: ${phone}
            </p>

            <p style="margin-top:18px;color:#6b7280;font-size:13px;">
              No further action is required from your side.
            </p>

          </td>
        </tr>

        <tr>
          <td style="padding:18px 28px;background:#f8fafc;color:#9ca3af;font-size:12px;text-align:center;">
            SocioServe — Trusted household services for your society
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
