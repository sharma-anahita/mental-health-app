import nodemailer from 'nodemailer';

function getMailerConfig() {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM; // sender email address

  if (!emailUser || !emailPassword || !emailFrom) {
    throw new Error('Email configuration not set. Please set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM in .env');
  }

  // Gmail SMTP configuration
  return {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  };
}

const transporter = nodemailer.createTransport(getMailerConfig());

export default transporter;
