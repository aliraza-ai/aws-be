const sendEmail = require("../utils/sendMail");
const path = require("path");
const express = require("express");
const userService = require("../services/UserService");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const ImageCountService = require("../services/ImageCountService");
const verifyToken = require("../config/middleware");
const axios = require("axios");
const User = require("../models/User");

const bcrypt = require("bcrypt");
const fs = require("fs");

dotenv.config();

const router = express.Router();

// register new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email is in a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Check if the email already exists in the database
  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Create the user if email is valid and doesn't exist
  const newUser = await userService.createUser(name, email, password);
  if (newUser) {
    return res.status(201).json({ message: "User created successfully" });
  } else {
    return res.status(500).json({ message: "Failed to create user" });
  }
});

// Update user details
router.put("/updateUser/:id", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const {
    name,
    email,
    password,
    phone_number,
    address,
    company_name,
    company_position,
    short_bio,
  } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  // Check if the email is in a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Check if the user exists
    const existingUser = await userService.findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the updated email is already in use by another user
    if (email !== existingUser.email) {
      const emailInUse = await userService.findUserByEmail(email);
      if (emailInUse) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Update user details
    const updatedUser = await userService.updateUser(userId, {
      name: name || existingUser.name,
      email: email || existingUser.email,
      password: password || existingUser.password,
      phone_number: phone_number || existingUser.phone_number,
      address: address || existingUser.address,
      company_name: company_name || existingUser.company_name,
      company_position: company_position || existingUser.company_position,
      short_bio: short_bio || existingUser.short_bio,
    });
    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user" });
  }
});

// Change password
router.put("/updatePassword/:id", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { oldPassword, newPassword } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Check if newPassword exists and is not empty
    if (!newPassword || newPassword.trim() === "") {
      return res.status(400).json({ message: "New password is required" });
    }

    const existingUser = await userService.findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordUpdated = await userService.updatePassword(
      userId,
      oldPassword,
      newPassword
    );

    if (!passwordUpdated) {
      return res.status(400).json({
        message: "Failed to update password. Incorrect old password.",
      });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Failed to update password" });
  }
});

// Get user details by ID from request body
router.get("/user", verifyToken, async (req, res) => {
  const { userId } = req.query; // Retrieve userId from query parameters

  if (!userId || isNaN(parseInt(userId))) {
    return res
      .status(400)
      .json({ message: "Invalid or missing user ID in request query" });
  }

  try {
    // Find the user by ID
    const user = await userService.findUserDetailsById(parseInt(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user details" });
  }
});

// Delete user
router.delete("/deletUser/:id", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Check if the user exists
    const existingUser = await userService.findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    const deleted = await userService.deleteUser(userId);
    if (deleted) {
      return res.status(200).json({ message: "User deleted successfully" });
    } else {
      return res.status(500).json({ message: "Failed to delete user" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

// login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (await userService.comparePasswords(password, user.password)) {
    // Generate JWT token and proceed with login
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    return res.status(200).json({
      message: "Login successful",
      token,
      name: user.name,
      id: user.id,
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// send reset email
const sendPasswordResetEmail = async (userEmail, reset_token) => {
  const resetLink = `${process.env.APP_URL}reset-password?token=${reset_token}`;
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "resetPasswordTemplate.html"
  );

  fs.readFile(templatePath, "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading HTML template:", err);
      return;
    }

    const emailContent = data.replace("{{resetLink}}", resetLink);

    const isSuccess = await sendEmail(
      userEmail,
      "Password Reset",
      emailContent
    );

    if (isSuccess) {
      console.log("Password reset email sent successfully.");
    } else {
      console.error("Error sending password reset email.");
    }
  });
};

// forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const reset_token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  try {
    user.reset_token = reset_token;
    await user.save();
    await sendPasswordResetEmail(email, reset_token);

    return res
      .status(200)
      .json({ message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and newPassword are required for password reset",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userService.findUserByEmail(decoded.email);

    if (!user || user.reset_token !== token) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.reset_token = null;
    await user.save();

    return res.status(200).json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(401).json({ message: "Invalid or expired reset token" });
  }
});

router.get("/get-words-left/:userId", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser || authenticatedUser.id !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const words_left = user.words_left;

    res.status(200).json({ words_left });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create-chat/:userId", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const chatMessage = req.body.message;

  try {
    const user = await User.findByPk(userId);

    if (!user || user.id !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.chat_count <= 0) {
      return res.status(400).json({ message: "Out of chats limit" });
    }

    const openaiApiEndpoint =
      "https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions";

    const response = await axios.post(
      openaiApiEndpoint,
      {
        prompt: chatMessage,
        max_tokens: 500,
        temperature: 0.5,
        frequency_penalty: 0,
        presence_penalty: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    user.chat_count -= 1;
    const updated = await user.save();

    if (!updated) {
      return res
        .status(500)
        .json({ message: "Error updating chat_left count" });
    }

    res.status(200).json({
      message: response.data.choices[0].text,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-chat-left/:userId", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser || authenticatedUser.id !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const chat_left = user.chat_count;

    res.status(200).json({ chat_left });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update image count
router.post("/:userId/update-image-count", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const newImageCount = req.body.imageCount;

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const updatedUser = await ImageCountService.updateImageCount(
      userId,
      newImageCount
    );
    return res.status(200).json({
      message: "Image count updated successfully",
      images_left: updatedUser.image_count,
    });
  } catch (error) {
    console.error("Error updating image count:", error);
    return res.status(500).json({ message: "Failed to update image count" });
  }
});

// get images count
router.get("/:userId/image-count", verifyToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ imageCount: user.image_count || 0 });
  } catch (error) {
    console.error("Error fetching image count:", error);
    return res.status(500).json({ message: "Failed to fetch image count" });
  }
});

// webhook
router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case "checkout.session.async_payment_failed":
          handleAsyncPaymentFailed();
          break;

        case "payment_method.attached":
          handlePaymentMethodAttached();
          break;

        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(event.data.object);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error("Error during webhook processing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

async function handleAsyncPaymentFailed() {
  // Handle async payment failed event
}

async function handlePaymentMethodAttached() {
  // Handle payment method attached event
}

async function handleCheckoutSessionCompleted(checkoutSession) {
  const customerEmail = checkoutSession.customer_details.email;

  console.log(`Customer email: ${customerEmail}`);

  if (!isValidEmailFormat(customerEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const existingUser = await userService.findUserByEmail(customerEmail);
  if (!existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email doesn't exist" });
  }

  const updatedUser = await updateUserInfoFromPlan(existingUser, selectedPlan);

  if (updatedUser) {
    console.log(`User information updated successfully for ${customerEmail}`);
  } else {
    console.error(`Failed to update user information for ${customerEmail}`);
  }
}

function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function updateUserInfoFromPlan(user, plan) {
  if (plan) {
    return userService.updateUserInformation(
      user.email,
      plan.words_left,
      plan.chat_count,
      plan.image_count,
      plan.plan_name
    );
  } else {
    console.error(`Selected plan not found for ${user.email}`);
    return null;
  }
}

module.exports = router;
