export const adminNotifyEmail = ({ name, serviceType, phone }) => `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial;background:#f8fafc;padding:30px 0;">
  <tr>
    <td align="center">
      <table width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;">

        <tr>
          <td style="padding:24px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#0f172a;">SocioServe Admin Alert</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:28px;">

            <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">
              New Maid Registration
            </h1>

            <p style="margin:0 0 12px;color:#374151;">
              A new maid has submitted their details for approval.
            </p>

            <p style="margin:0 0 12px;color:#374151;">
              <strong>Name:</strong> ${name}<br>
              <strong>Service:</strong> ${serviceType}<br>
              <strong>Phone:</strong> ${phone}
            </p>

            <p style="margin-top:18px;color:#6b7280;font-size:13px;">
              Login to the admin dashboard to review and approve.
            </p>

          </td>
        </tr>

        <tr>
          <td style="padding:18px;background:#f8fafc;color:#9ca3af;font-size:12px;text-align:center;">
            SocioServe Notifications
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
