// generateSlipPDF.js
import jsPDF from "jspdf";

export function generateSlipPDF(formData) {
  const doc = new jsPDF();

  // Unique slip number
  const slipNo = `HRVF-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
  const today = new Date().toLocaleDateString("en-NG");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Human Rights Violation and Advocacy Foundation (HRVF)", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("Membership Acknowledgment Slip", 105, 30, { align: "center" });

  // User Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Slip No: ${slipNo}`, 20, 50);
  doc.text(`Full Name: ${formData.fullname}`, 20, 60);
  doc.text(`Email: ${formData.email}`, 20, 70);
  doc.text(`Phone: ${formData.phone}`, 20, 80);
  doc.text(`Membership Type: ${formData.membershipType || "General"}`, 20, 90);
  doc.text(`Payment Reference: ${formData.paymentReference}`, 20, 100);
  doc.text(`Date: ${today}`, 20, 110);

  // Draw circular seal
  const centerX = 150;
  const centerY = 70;
  const radius = 40;

  // Circle
  doc.setDrawColor(178, 34, 34);
  doc.setLineWidth(1.5);
  doc.circle(centerX, centerY, radius, "S");

  // Curved text along top half of the circle
  const sealText = "HUMAN RIGHTS VIOLATIONS AND ADVOCACY FOUNDATION";
  const angleStep = Math.PI / sealText.length; // top half
  for (let i = 0; i < sealText.length; i++) {
    const angle = -Math.PI / 2 + i * angleStep; // start at left top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle) + 2; // small offset
    doc.setFontSize(6);
    doc.text(sealText[i], x, y, { align: "center", angle: (angle * 180) / Math.PI + 90 });
  }

  // Footer
  doc.setFontSize(10);
  doc.text("✊ Defending Human Rights, Protecting Dignity", 105, 160, { align: "center" });
  doc.text("© 2025 Human Rights Violation and Advocacy Foundation", 105, 168, { align: "center" });

  // Save PDF
  doc.save(`${formData.fullname}_HRVF_Slip.pdf`);
}
