import express from "express";
import ContactController from "../controllers/ContactController";
import ContactService from "../services/ContactService";

const router = express.Router();
const contactService = new ContactService();

const contactController = new ContactController(contactService);

// Create a new contact
router.post("/", async (req, res) => {
  await contactController.createContact(req, res);
});

export default router;
