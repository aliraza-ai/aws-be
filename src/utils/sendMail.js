const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

function isError(err) {
  return err instanceof Error;
}

const sendEmail = async (email, subject, html, cc, bcc) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const data = {
      from: `Reset Password <noreply@intelliwriter.io>`,
      to: email,
      subject: subject,
      html: html,
      cc: cc,
      bcc: bcc,
    };

    await transporter.sendMail(data);

    return true;
  } catch (error) {
    if (isError(error)) {
      console.error("Error sending email:", error.message);
    } else {
      console.error("Error sending email:", error);
    }
    return false;
  }
};

module.exports = sendEmail;
