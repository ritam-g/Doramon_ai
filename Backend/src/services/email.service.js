import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const data = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html,
  });

  console.log(data);
};

export default sendEmail;