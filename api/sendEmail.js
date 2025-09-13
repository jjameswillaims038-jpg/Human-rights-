import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import Busboy from "busboy";
import { generateSlipPDF } from "./generateSlipPDF.js";

export const config = {
  api: { bodyParser: false }, // disable default body parser for Busboy
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const tmpdir = os.tmpdir();
  const fields = {};
  const files = {};
  const fileWritePromises = [];

  const bb = Busboy({ headers: req.headers });

  bb.on("file", (fieldname, file, info) => {
    const filename = info?.filename || `upload-${Date.now()}`;
    const filepath = path.join(tmpdir, `${uuidv4()}-${filename}`);

    const writePromise = new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
      writeStream.on("finish", () => {
        files[fieldname] = { path: filepath, filename };
        resolve();
      });
      writeStream.on("error", reject);
    });

    fileWritePromises.push(writePromise);
  });

  bb.on("field", (fieldname, value) => {
    fields[fieldname] = value;
  });

  bb.on("finish", async () => {
    try {
      await Promise.all(fileWritePromises);

      // --- Payment Data ---
      const paymentData = {
        reference: fields.paymentReference || "N/A",
        amount: fields.amount || 0,
        paidAt: new Date().toISOString(),
        status: "Verified",
      };

      // --- Generate Membership Slip PDF (Buffer now) ---
      const slipBuffer = await generateSlipPDF(fields, paymentData);

      const passportFile = files.passport;

      // --- Email Transporter ---
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "yourhrvfemail@gmail.com",
          pass: process.env.GMAIL_APP_PASSWORD, // set in Vercel env vars
        },
      });

      // --- Admin Email ---
      const adminBody = `
New member registration received!

Full Name: ${fields.fullname}
Email: ${fields.email || "N/A"}
Phone: ${fields.phone || "N/A"}
Address: ${fields.address || "N/A"}
Confirmed Info: ${fields.confirm === "on" ? "Yes" : "No"}

Payment Reference: ${paymentData.reference}
Amount Paid: ₦${(paymentData.amount / 100).toFixed(2)}
Status: ${paymentData.status}

Attachments: Membership Slip${passportFile ? " + Passport" : ""}
`;

      const attachments = [
        { filename: "membership_slip.pdf", content: slipBuffer },
      ];
      if (passportFile) {
        attachments.push({ filename: passportFile.filename, path: passportFile.path });
      }

      await transporter.sendMail({
        from: "yourhrvfemail@gmail.com",
        to: "yourhrvfemail@gmail.com",
        subject: "New G.N.N.HRVF Membership Registered",
        text: adminBody,
        attachments,
      });

      // --- Member Email ---
      if (fields.email) {
        await transporter.sendMail({
          from: "yourhrvfemail@gmail.com",
          to: fields.email,
          subject: "Your G.N.N.HRVF Membership Acknowledgment Slip",
          text: `Dear ${fields.fullname},

Your membership registration with G.N.N.HRVF has been received successfully.

Payment Reference: ${paymentData.reference}

Please find attached your official acknowledgment slip.

Welcome to G.N.N.HRVF ✊

— Human Rights Violation and Advocacy Foundation (G.N.N.HRVF)`,
          attachments: [{ filename: "membership_slip.pdf", content: slipBuffer }],
        });
      }

      // --- Cleanup temporary passport file only ---
      if (passportFile) {
        try { fs.unlinkSync(passportFile.path); } catch {}
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Error in sendEmail:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  req.pipe(bb);
}
