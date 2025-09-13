import { generateSlip } from "./generateSlip.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const formData = {
      fullname: req.body.fullname || "John Doe",
      email: req.body.email || "test@example.com",
      phone: req.body.phone || "08012345678",
    };

    const paymentData = {
      reference: "TEST1234",
      amount: 15000,
      paidAt: new Date().toISOString(),
    };

    const pdfBuffer = await generateSlip(formData, paymentData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=membership_slip.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
