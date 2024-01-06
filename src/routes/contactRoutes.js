const express = require("express");
const ContactController = require("../controllers/ContactController");
const ContactService = require("../services/ContactService");

const router = express.Router();
const contactService = new ContactService();

const contactController = new ContactController(contactService);

// Create a new contact
router.post("/", async (req, res) => {
  await contactController.createContact(req, res);
});

module.exports = router;
