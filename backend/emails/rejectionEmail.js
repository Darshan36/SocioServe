export const rejectionEmail = ({ name, reason }) => `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial;background:#fff4f4;padding:30px 0;">
  <tr>
    <td align="center">
      <table width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        
        <tr>
          <td style="padding:24px;border-bottom:1px solid #f3dada;">
            <h2 style="margin:0;color:#b91c1c;">SocioServe</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:28px;">

            <h1 style="margin:0 0 12px;font-size:22px;color:#b91c1c;">
              Application Update
            </h1>

            <p style="margin:0 0 20px;color:#374151;">
              Hello <strong>${name}</strong>,<br>
              Unfortunately, your verification <strong style="color:#dc2626;">could not be approved</strong>.
            </p>

            <p style="margin:0 0 12px;color:#374151;">
              <strong>Reason:</strong><br>
              ${reason}
            </p>

            <p style="margin-top:18px;color:#6b7280;font-size:13px;">
              You may register again after resolving the issue.
            </p>

          </td>
        </tr>

        <tr>
          <td style="padding:18px;background:#fff1f2;color:#9ca3af;font-size:12px;text-align:center;">
            SocioServe Verification Team
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
