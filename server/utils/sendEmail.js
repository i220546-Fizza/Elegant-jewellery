const nodemailer = require('nodemailer');

const isConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

// Sends an email when SMTP is configured; otherwise logs it so local development
// still works end-to-end. Returns true when an email was actually sent.
const sendEmail = async ({ to, subject, text, html }) => {
  if (!isConfigured()) {
    console.log(`[email not sent - SMTP not configured] To: ${to} | ${subject}\n${text}`);
    return false;
  }
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `NB Classic Scents <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return true;
};

module.exports = { sendEmail, isEmailConfigured: isConfigured };
