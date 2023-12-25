import Contact from "../models/Contact";

interface ContactAttributes {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string; 
  message: string;
}

class ContactService {
  async createContact(data: Partial<ContactAttributes>): Promise<Contact> {
    try {
      const contact = await Contact.create(data as ContactAttributes);
      return contact;
    } catch (error) {
      throw new Error(`Could not create contact: ${error}`);
    }
  }
}

export default ContactService;
