import "dotenv/config";
import dns from "node:dns";
import nodemailer from "nodemailer";

dns.setDefaultResultOrder("ipv4first");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = (process.env.SMTP_SECURE || "true") === "true";
const SMTP_FORCE_IPV4 = (process.env.SMTP_FORCE_IPV4 || "true") === "true";
const SMTP_CONNECTION_TIMEOUT = Number(process.env.SMTP_CONNECTION_TIMEOUT || 12000);
const SMTP_GREETING_TIMEOUT = Number(process.env.SMTP_GREETING_TIMEOUT || 9000);
const SMTP_SOCKET_TIMEOUT = Number(process.env.SMTP_SOCKET_TIMEOUT || 15000);

function getSanitizedEmailPassword() {
  // Google app passwords are often pasted with spaces. Remove them defensively.
  return (process.env.GOOGLE_EMAIL_PASS || "").replace(/\s+/g, "");
}

function createTransport({ port, secure }) {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.GOOGLE_EMAIL_USER,
      pass: getSanitizedEmailPassword(),
    },
    // Prefer IPv4 for providers/environments that have flaky IPv6 egress.
    family: SMTP_FORCE_IPV4 ? 4 : 0,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT,
    greetingTimeout: SMTP_GREETING_TIMEOUT,
    socketTimeout: SMTP_SOCKET_TIMEOUT,
    dnsTimeout: 8000,
    tls: {
      minVersion: "TLSv1.2",
      servername: SMTP_HOST,
    },
  });
}

function getSmtpStrategies() {
  const strategies = [{ port: SMTP_PORT, secure: SMTP_SECURE }];

  // Gmail fallback path: if explicit config fails, try submission port 587.
  if (SMTP_HOST === "smtp.gmail.com" && (SMTP_PORT !== 587 || SMTP_SECURE !== false)) {
    strategies.push({ port: 587, secure: false });
  }

  // Add 465 fallback if primary is not that.
  if (SMTP_HOST === "smtp.gmail.com" && (SMTP_PORT !== 465 || SMTP_SECURE !== true)) {
    strategies.push({ port: 465, secure: true });
  }

  return strategies;
}

async function sendWithFallback(mailOptions) {
  const strategies = getSmtpStrategies();
  let lastError;

  for (let index = 0; index < strategies.length; index += 1) {
    const strategy = strategies[index];
    const label = `${SMTP_HOST}:${strategy.port} secure=${strategy.secure}`;

    try {
      const transporter = createTransport(strategy);
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`Email strategy ${index + 1}/${strategies.length} failed (${label}):`, error?.message || error);
    }
  }

  throw lastError;
}

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.GOOGLE_EMAIL_USER || !process.env.GOOGLE_EMAIL_PASS) {
    throw new Error("Email service is not configured");
  }

  const info = await sendWithFallback({
    from: process.env.MAIL_FROM || process.env.GOOGLE_EMAIL_USER,
    to,
    subject,
    text,
    html,
  });

  console.log(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

export default sendEmail;
