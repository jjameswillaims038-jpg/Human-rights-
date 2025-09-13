import PDFDocument from "pdfkit";

/**
 * Generate slip number like HRVF251234
 */
function generateSlipNumber() {
  const prefix = "G.N.N.HRVF"; 
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${rand}`;
}

/**
 * Generates a membership acknowledgment slip PDF as a Buffer
 */
async function generateSlipPDF(formData, paymentData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // HEADER
      doc.fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(
          "G.N.Nwodu Human Rights Violation and Advocacy Foundation (G.N.N.HRVF)",
          { align: "center" }
        );
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(14).text(
        "MEMBERSHIP ACKNOWLEDGMENT SLIP",
        { align: "center" }
      );
      doc.moveDown(2);

      // DETAILS
      const slipNo = generateSlipNumber();
      const fullName =
        formData.fullname ||
        `${formData.surname || ""} ${formData.othernames || ""}`.trim() ||
        "N/A";

      doc.font("Helvetica").fontSize(12);
      doc.font("Helvetica-Bold").text("Slip Number: ", { continued: true }).font("Helvetica").text(slipNo);
      doc.font("Helvetica-Bold").text("Name: ", { continued: true }).font("Helvetica").text(fullName);
      doc.font("Helvetica-Bold").text("Email: ", { continued: true }).font("Helvetica").text(formData.email || "N/A");
      doc.font("Helvetica-Bold").text("Phone: ", { continued: true }).font("Helvetica").text(formData.phone || "N/A");
      doc.font("Helvetica-Bold").text("Payment Reference: ", { continued: true }).font("Helvetica").text(paymentData.reference || "N/A");
      doc.font("Helvetica-Bold").text("Amount Paid: ", { continued: true }).font("Helvetica").text(
        `₦${paymentData.amount ? (paymentData.amount / 100).toFixed(2) : "0.00"}`
      );
      doc.font("Helvetica-Bold").text("Payment Date: ", { continued: true }).font("Helvetica").text(
        paymentData.paidAt ? new Date(paymentData.paidAt).toLocaleString() : "N/A"
      );

      doc.moveDown(1.5);
      doc.font("Helvetica-Bold").text("Membership Status: ", { continued: true }).font("Helvetica").text("ACTIVE");
      doc.moveDown(2);

      // SEAL
      const cx = doc.page.width - 110;
      const cy = doc.page.height - 140;
      doc.save();
      doc.circle(cx, cy, 60).lineWidth(3).stroke("#b22222");
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#b22222")
        .text("G.N.Nwodu HUMAN RIGHTS VIOLATIONS\nAND ADVOCACY FOUNDATION", cx - 50, cy - 36, { width: 100, align: "center" });
      doc.fontSize(12).text("AUTHORISED", cx - 50, cy - 6, { width: 100, align: "center" });
      doc.restore();

      // FOOTER
      doc.moveDown(3);
      doc.fillColor("black").font("Helvetica-Oblique").fontSize(10)
        .text("✊ Defending Human Rights, Protecting Dignity", { align: "center" });
      doc.text("© 2025 G.N.Nwodu Human Rights Violation and Advocacy Foundation", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fullname, email, phone, paymentReference, amount } = req.body || {};

    const formData = { fullname, email, phone };
    const paymentData = {
      reference: paymentReference || "N/A",
      amount: amount || 0,
      paidAt: new Date().toISOString(),
    };

    const pdfBuffer = await generateSlipPDF(formData, paymentData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=membership_slip.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ Error generating slip:", err);
    res.status(500).json({ error: "Failed to generate slip" });
  }
}
