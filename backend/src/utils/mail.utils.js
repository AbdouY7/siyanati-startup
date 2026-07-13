const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL SENT - MOCK] To: ${to} | Subject: ${subject}`);
      console.log(`[EMAIL BODY]:\n${html}\n`);
      console.warn("⚠️ SMTP credentials not configured in .env. Email was only logged.");
      return true; // Pretend it succeeded
    }

    const info = await transporter.sendMail({
      from: `"Siyanati" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
    return false;
  }
};

module.exports = {
  sendEmail,
};
