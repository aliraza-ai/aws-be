import { Request, Response } from "express";
import ContactService from "../services/ContactService";
import { UniqueConstraintError } from "sequelize";

class ContactController {
  private contactService: ContactService;

  constructor(contactService: ContactService) {
    this.contactService = contactService;
  }

  async createContact(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      if (error instanceof UniqueConstraintError) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        // Handle other errors generically
        res.status(500).json({ error: "Something went wrong" });
      }
    }
  }
}

export default ContactController;
