import nodemailer from 'nodemailer';
import env from '~/config/environment';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD
  }
});

transporter.verify();

const sendEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: `"LaundryPro" <${env.GMAIL_USER}>`,
    to,
    subject,
    html
  });
};

export const MailProvider = { sendEmail };