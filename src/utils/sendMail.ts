import nodemailer, { TransportOptions } from "nodemailer";
import dotenv from "dotenv";

function isError(err: any): err is Error {
  return err instanceof Error;
}

const sendEmail = async (
  email: string,
  subject: string,
  html: string,
  cc?: string | string[],
  bcc?: string | string[]
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    } as TransportOptions);

    const data: nodemailer.SendMailOptions = {
      from: `Reset Password <noreply@intelliwriter.io>`,
      to: email,
      subject: subject,
      html: html,
      cc: cc,
      bcc: bcc,
    };

    await transporter.sendMail(data);

    return true;
  } catch (error: any) {
    if (isError(error)) {
      console.error("Error sending email:", error.message);
    } else {
      console.error("Error sending email:", error);
    }
    return false;
  }
};

export default sendEmail;
