import 'dotenv/config'
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_EMAIL_USER,
        pass:process.env.GOOGLE_EMAIL_PASS
       
    }
})

// Function to send email
const sendEmail = async ({ to, subject, text, html }) => {
  try {

    console.log("EMAIL INPUT:", { to, subject, text, html });

    const info = await transporter.sendMail({
      from: process.env.GOOGLE_EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html
    });

    console.log("Message sent:", info.messageId);

    return `Email sent successfully to ${to}`;

  } catch (error) {

    console.error("Error sending email:", error.message);
    return `Email failed: ${error.message}`;

  }
};

export default sendEmail;

