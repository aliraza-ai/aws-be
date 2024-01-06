const { UniqueConstraintError } = require("sequelize");
const nodemailer = require("nodemailer");
require("dotenv").config();

class ContactController {
  constructor(contactService) {
    this.contactService = contactService;
  }

  async createContact(req, res) {
    try {
      const { name, email, phone, subject, message } = req.body;
      const contact = await this.contactService.createContact({
        name,
        email,
        phone,
        subject,
        message,
      });

      // Send success message
      res.status(201).json({ message: "Thanks for contacting us!", contact });

      // Send email notification
      this.sendContactEmail(
        name,
        email,
        phone,
        subject,
        message,
        req.body.fromEmail
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Something went wrong" });
      }
    }
  }

  sendContactEmail(name, email, phone, subject, message, fromEmail) {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Construct email content
    const mailOptions = {
      from: fromEmail || process.env.EMAIL_USER,
      to: process.env.COMPANY_EMAIL,
      subject: "New Contact Form Submission",
      html: `
        <h3>Contact Details:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  }
}

module.exports = ContactController;
