import "dotenv/config";
import dns from "node:dns";
import { promisify } from "node:util";
import nodemailer from "nodemailer";

dns.setDefaultResultOrder("ipv4first");
const resolve4 = promisify(dns.resolve4);

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = (process.env.SMTP_SECURE || "true") === "true";
const SMTP_FORCE_IPV4 = (process.env.SMTP_FORCE_IPV4 || "true") === "true";
const SMTP_CONNECTION_TIMEOUT = Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000);
const SMTP_GREETING_TIMEOUT = Number(process.env.SMTP_GREETING_TIMEOUT || 10000);
const SMTP_SOCKET_TIMEOUT = Number(process.env.SMTP_SOCKET_TIMEOUT || 20000);

function getSanitizedEmailPassword() {
  // Google app passwords are often pasted with spaces. Remove them defensively.
  return (process.env.GOOGLE_EMAIL_PASS || "").replace(/\s+/g, "");
}

async function buildTransport() {
  let smtpHost = SMTP_HOST;
  const tlsOptions = { minVersion: "TLSv1.2" };

  if (SMTP_FORCE_IPV4) {
    try {
      const addresses = await resolve4(SMTP_HOST);
      if (addresses?.length) {
        smtpHost = addresses[0];
        // Required when connecting to an IP over TLS for correct cert validation.
        tlsOptions.servername = SMTP_HOST;
      }
    } catch (error) {
      console.warn(`IPv4 DNS resolve failed for ${SMTP_HOST}. Falling back to hostname.`);
    }
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: process.env.GOOGLE_EMAIL_USER,
      pass: getSanitizedEmailPassword(),
    },
    connectionTimeout: SMTP_CONNECTION_TIMEOUT,
    greetingTimeout: SMTP_GREETING_TIMEOUT,
    socketTimeout: SMTP_SOCKET_TIMEOUT,
    tls: tlsOptions,
  });
}

async function sendWithRetry(mailOptions, maxAttempts = 2) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const transporter = await buildTransport();
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      console.error(`Email attempt ${attempt}/${maxAttempts} failed:`, error?.message || error);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
    }
  }

  throw lastError;
}

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.GOOGLE_EMAIL_USER || !process.env.GOOGLE_EMAIL_PASS) {
    throw new Error("Email service is not configured");
  }

  const info = await sendWithRetry({
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
