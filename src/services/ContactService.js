const Contact = require("../models/Contact");

class ContactService {
  async createContact(data) {
    try {
      const contact = await Contact.create(data);
      return contact;
    } catch (error) {
      throw new Error(`Could not create contact: ${error}`);
    }
  }
}

module.exports = ContactService;
