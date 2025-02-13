const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  // Check if email feature is enabled
  if (process.env.EMAIL_FEATURE !== 'true') {
    console.log('Email feature is disabled. Would have sent:', { to, subject, text });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
}; 