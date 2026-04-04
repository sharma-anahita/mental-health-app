import nodemailer from 'nodemailer';

function getMailerConfig() {
  const emailService = process.env.EMAIL_SERVICE; // e.g., 'gmail', 'outlook'
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM; // sender email address

  if (!emailUser || !emailPassword || !emailFrom) {
    throw new Error('Email configuration not set. Please set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM in .env');
  }

  if (emailService) {
    // Using a well-known email service (Gmail, Outlook, etc.)
    return {
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    };
  } else {
    // Using a custom SMTP server
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpSecure = process.env.SMTP_SECURE === 'true'; // true for 465 (TLS), false for 587 (STARTTLS)

    if (!smtpHost) {
      throw new Error('Either EMAIL_SERVICE or SMTP_HOST must be configured');
    }

    return {
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    };
  }
}

const transporter = nodemailer.createTransport(getMailerConfig());

export default transporter;
