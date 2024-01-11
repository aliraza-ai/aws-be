const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { SES } = require("aws-sdk");

dotenv.config();

function isError(err) {
  return err instanceof Error;
}

const sendEmail = async (email, subject, html, cc, bcc) => {
  try {
    const transporter = nodemailer.createTransport({
      SES: new SES({
        apiVersion: "2010-12-01",
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_SES_REGION, n
      }),
    });

    const data = {
      from: `Reset Password <${process.env.EMAIL_USERNAME}>`,
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
