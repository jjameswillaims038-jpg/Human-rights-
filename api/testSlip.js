import fs from "fs";
import { generateSlipPDF } from "./generateSlip.js";

async function testSlip() {
  const formData = {
    fullname: "Jane Doe",
    email: "jane@example.com",
    phone: "08123456789",
  };

  const paymentData = {
    reference: "TEST1234",
    amount: 15000,
    paidAt: new Date().toISOString(),
  };

  try {
    const pdfBuffer = await generateSlipPDF(formData, paymentData);
    fs.writeFileSync("testSlip.pdf", pdfBuffer);
    console.log("✅ Slip generated as testSlip.pdf");
  } catch (err) {
    console.error("❌ Error generating slip:", err);
  }
}

testSlip();
