// sendEmail.js (Netlify Function in /.netlify/functions/)
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const busboy = require("busboy");
const generateSlip = require("./generateSlip");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
    };
  }

  return new Promise((resolve) => {
    const bb = busboy({ headers: event.headers });
    const fields = {};
    const files = {};
    const tmpdir = os.tmpdir();
    const fileWritePromises = [];

    // --- Capture file uploads ---
    bb.on("file", (fieldname, file, info) => {
      const filename = info?.filename || `upload-${Date.now()}`;
      const filepath = path.join(tmpdir, `${uuidv4()}-${filename}`);

      const writePromise = new Promise((fileResolve, fileReject) => {
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
        writeStream.on("finish", () => {
          const fileData = { path: filepath, filename };
          if (files[fieldname]) {
            if (Array.isArray(files[fieldname])) files[fieldname].push(fileData);
            else files[fieldname] = [files[fieldname], fileData];
          } else {
            files[fieldname] = fileData;
          }
          fileResolve();
        });
        writeStream.on("error", (err) => fileReject(err));
      });

      fileWritePromises.push(writePromise);
    });

    // --- Capture text fields ---
    bb.on("field", (fieldname, value) => {
      fields[fieldname] = value;
    });

    // --- Finish parsing form ---
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

        // --- Generate Membership Slip ---
        const slipPath = await generateSlip(fields, paymentData);

        // Helper: get single file
        const getSingleFile = (fileField) =>
          Array.isArray(fileField) ? fileField[0] : fileField;

        const passportFile = getSingleFile(files.passport);

        // --- Email Transporter ---
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "yourhrvfemail@gmail.com", // 🔹 replace with HRVF Gmail
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        // --- Attachments ---
        const attachments = [{ filename: "membership_slip.pdf", path: slipPath }];
        if (passportFile && passportFile.path) {
          attachments.push({
            filename: passportFile.filename,
            path: passportFile.path,
          });
        }

        // --- Admin Email ---
        const adminBody = `
A new member has registered successfully.

--- Personal Info ---
Full Name: ${fields.surname || ""} ${fields.othernames || ""}
Gender: ${fields.gender || "N/A"}
Date of Birth: ${fields.dob || "N/A"}
Phone: ${fields.phone || "N/A"}
Email: ${fields.email || "N/A"}
Address: ${fields.address || "N/A"}

--- Next of Kin ---
Name: ${fields.nok_name || "N/A"}
Relationship: ${fields.nok_relationship || "N/A"}
Phone: ${fields.nok_phone || "N/A"}

--- Payment ---
Reference: ${paymentData.reference}
Amount Paid: ₦${(paymentData.amount / 100).toFixed(2)}
Status: ${paymentData.status}

📎 Attachments: Membership Slip + Passport
`;

        await transporter.sendMail({
          from: "yourhrvfemail@gmail.com",
          to: "yourhrvfemail@gmail.com",
          subject: "New HRVF Membership Registered",
          text: adminBody,
          attachments,
        });

        // --- Member Email ---
        if (fields.email) {
          await transporter.sendMail({
            from: "yourhrvfemail@gmail.com",
            to: fields.email,
            subject: "Your HRVF Membership Acknowledgment Slip",
            text: `Dear ${fields.surname || "Member"},

Your membership registration with the Human Rights Violation and Advocacy Foundation (HRVF) has been received successfully.

Payment Reference: ${paymentData.reference}

Please find attached your official acknowledgment slip.

Welcome to HRVF ✊

— Human Rights Violation and Advocacy Foundation (HRVF)`,
            attachments: [{ filename: "membership_slip.pdf", path: slipPath }],
          });
        }

        // --- Cleanup temp files ---
        const clean = (f) => {
          try {
            fs.unlinkSync(f);
          } catch {}
        };
        clean(slipPath);
        if (passportFile && passportFile.path) clean(passportFile.path);

        resolve({
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ success: true }),
        });
      } catch (err) {
        console.error("❌ Error inside sendEmail:", err);
        resolve({
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        });
      }
    });

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body;
    bb.end(body);
  });
};
