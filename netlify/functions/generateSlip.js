// generateSlip.js
function generateSlip(formData) {
  // Unique slip number
  const prefix = "HRVF";
  const slipNo =
    prefix +
    "-" +
    Math.floor(1000 + Math.random() * 9000) +
    "-" +
    new Date().getFullYear();

  // Date
  const today = new Date().toLocaleDateString("en-NG");

  // Slip content
  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>HRVF Membership Acknowledgment Slip</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: #f8f9fa; }
          .slip { border: 2px solid #222; padding: 30px; max-width: 700px; margin: auto; background: #fff; }
          h2 { text-align: center; margin-bottom: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { width: 80px; }
          .org-name { font-size: 18px; font-weight: bold; margin-top: 10px; }
          .info { margin: 20px 0; }
          .info p { margin: 8px 0; font-size: 15px; }
          .label { font-weight: bold; }
          .footer { margin-top: 40px; font-size: 0.9em; text-align: center; }
          .stamp { margin-top: 40px; text-align: right; }
          .stamp img { width: 120px; opacity: 0.8; }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="header">
            <img src="https://yourdomain.com/images/logo.png" alt="HRVF Logo" />
            <div class="org-name">Human Rights Violation and Advocacy Foundation (HRVF)</div>
            <h2>Membership Acknowledgment Slip</h2>
          </div>

          <div class="info">
            <p><span class="label">Slip No:</span> ${slipNo}</p>
            <p><span class="label">Full Name:</span> ${formData.get("fullname")}</p>
            <p><span class="label">Email:</span> ${formData.get("email")}</p>
            <p><span class="label">Phone:</span> ${formData.get("phone")}</p>
            <p><span class="label">Membership Type:</span> ${formData.get("membershipType") || "General"}</p>
            <p><span class="label">Payment Reference:</span> ${formData.get("paymentReference")}</p>
            <p><span class="label">Date:</span> ${today}</p>
          </div>

          <div class="stamp">
            <p>Authorized Stamp/Seal:</p>
            <img src="https://yourdomain.com/images/stamp.png" alt="HRVF Stamp" />
          </div>

          <div class="footer">
            <p>✊ Defending Human Rights, Protecting Dignity</p>
            <p>© 2025 Human Rights Violation and Advocacy Foundation</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
