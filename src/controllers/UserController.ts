import sendEmail from "../utils/sendMail";
import path from "path";
import express, { Request, Response, Router } from "express";
import userService from "../services/UserService";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import verifyToken, { UserRequest } from "../config/middleware";
import axios from "axios";
import User from "../models/User";

declare const __dirname: string;
const bcrypt = require("bcrypt");
const fs = require("fs");

dotenv.config();

const router = express.Router();

// register new user
router.post("/register", async (req: Request, res: Response) => {
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
router.put(
  "/updateUser/:id",
  verifyToken,
  async (req: Request, res: Response) => {
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
  }
);

// Change password
router.put(
  "/updatePassword/:id",
  verifyToken,
  async (req: Request, res: Response) => {
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
  }
);

// Get user details by ID from request body
router.get("/user", verifyToken, async (req: Request, res: Response) => {
  const { userId } = req.query; // Retrieve userId from query parameters

  if (!userId || isNaN(parseInt(userId as string))) {
    return res
      .status(400)
      .json({ message: "Invalid or missing user ID in request query" });
  }

  try {
    // Find the user by ID
    const user = await userService.findUserDetailsById(
      parseInt(userId as string)
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user details" });
  }
});

// Delete user
router.delete(
  "/deletUser/:id",
  verifyToken,
  async (req: Request, res: Response) => {
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
  }
);

// login the user
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  //   if (!user.verified) {
  //     return res
  //       .status(401)
  //       .json({
  //         message: "Email not verified. Please verify your email to login.",
  //       });
  //   }

  if (await userService.comparePasswords(password, user.password)) {
    // Generate JWT token and proceed with login
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
      },
      process.env.JWT_SECRET as string,
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
const sendPasswordResetEmail = async (
  userEmail: string,
  reset_token: string
) => {
  // Define the reset link
  const resetLink = `${process.env.APP_URL}reset-password?token=${reset_token}`;
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "resetPasswordTemplate.html"
  );

  // Read the HTML template file
  fs.readFile(templatePath, "utf8", async (err: string, data: string) => {
    if (err) {
      console.error("Error reading HTML template:", err);
      return;
    }

    // Replace the placeholder with the actual reset link
    const emailContent = data.replace("{{resetLink}}", resetLink);

    // Send email using sendEmail function
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
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const reset_token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  try {
    // Store the reset token in the database or associate it with the user
    user.reset_token = reset_token;
    await user.save();

    // Send password reset email
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
router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and newPassword are required for password reset",
    });
  }

  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string };
    const user = await userService.findUserByEmail(decoded.email);

    if (!user || user.reset_token !== token) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password with the hashed value
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

// get the words count
router.get(
  "/get-words-left/:userId",
  verifyToken,
  async (req: UserRequest, res: Response) => {
    const userId = parseInt(req.params.userId, 10);

    try {
      const authenticatedUser = req.user;
      // Check if the authenticated user is requesting their own words_left
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
  }
);

//  words count function
// function countWords(chatMessage: string): number {
//   const wordsArray = chatMessage.trim().split(/\s+/);
//   const filteredWords = wordsArray.filter((word) => /[a-zA-Z0-9]+/.test(word));
//   return filteredWords.length;
// }

// update the words count
router.post(
  "/create-chat/:userId",
  verifyToken,
  async (req: UserRequest, res: Response) => {
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

      const openaiApiEndpoint = "https://api.openai.com/v1/engines/text-davinci-003/completions";

      const response = await axios.post(
        openaiApiEndpoint,
        {
          prompt: chatMessage,
          max_tokens: 500,
          temperature: 0.9,
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

      // Deduct chat for the chat
      const chat_count = user.chat_count -= 1;
      const updated = await user.save();

      if (!updated) {
        return res
          .status(500)
          .json({ message: "Error updating chat_left count" });
      }

      // const updatedUser = await userService.findUserById(userId);
      // if (!updatedUser) {
      //   return res
      //     .status(500)
      //     .json({ message: "Error fetching updated user details" });
      // }

      res.status(200).json({
        message: response.data.choices[0].text,
        // chat_left: user.chat_count,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/get-chat-left/:userId",
  verifyToken,
  async (req: UserRequest, res: Response) => {
    const userId = parseInt(req.params.userId, 10);

    try {
      const authenticatedUser = req.user;
      // Check if the authenticated user is requesting their own words_left
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
  }
);

export default router;
