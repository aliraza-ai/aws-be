const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class UserService {
  async createUser(name, email, password) {
    try {
      // Validation checks
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Password complexity validation
      if (password.length < 8) {
        throw new Error("Password should be at least 8 characters long");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  async findUserByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async comparePasswords(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  async initiatePasswordReset(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return null; // User not found
      }
      const reset_token = jwt.sign({ email }, process.env.JWT_RESET_SECRET, {
        expiresIn: "1d",
      });

      // Store the reset token in the database or associate it with the user
      user.reset_token = reset_token;
      await user.save();

      return reset_token;
    } catch (error) {
      console.error("Error initiating password reset:", error);
      return null;
    }
  }

  async findUserDetailsById(userId) {
    try {
      const user = await User.findOne({
        where: { id: userId },
        attributes: [
          "id",
          "name",
          "email",
          "password",
          "words_left",
          "chat_count",
          "phone_number",
          "address",
          "stripe_id",
          "company_name",
          "company_position",
          "short_bio",
        ],
      });
      return user;
    } catch (error) {
      console.error("Error finding user details by ID:", error);
      return null;
    }
  }

  async updateUser(userId, updatedData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return null;
      }

      // Update specific user details with provided data
      const {
        id,
        name,
        email,
        password,
        phone_number,
        address,
        company_name,
        company_position,
        short_bio,
      } = updatedData;

      if (id !== undefined) {
        user.id = id;
      }
      if (name !== undefined) {
        user.name = name;
      }
      if (email !== undefined) {
        user.email = email;
      }
      if (password !== undefined) {
        user.password = password;
      }
      if (phone_number !== undefined) {
        user.phone_number = phone_number;
      }
      if (address !== undefined) {
        user.address = address;
      }
      if (company_name !== undefined) {
        user.company_name = company_name;
      }
      if (company_position !== undefined) {
        user.company_position = company_position;
      }
      if (short_bio !== undefined) {
        user.short_bio = short_bio;
      }

      await user.save();

      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return false; // User not found
      }

      await user.destroy();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async resetPassword(email, reset_token, newPassword) {
    try {
      const user = await User.findOne({ where: { email, reset_token } });
      if (!user) {
        return false; // Invalid or expired reset token
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password and reset token after successful password reset
      user.password = hashedPassword;
      user.reset_token = null; // Reset the token after password change
      await user.save();

      return true; // Password reset successful
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  async findUserById(userId) {
    try {
      const user = await User.findByPk(userId);
      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async updateUserwords_left(userId, wordsUsed) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return false; // User not found
      }

      // Check if user has sufficient words left
      if (user.words_left - wordsUsed < 0) {
        return false; // Insufficient words left
      }

      // Deduct words for the chat
      user.words_left -= wordsUsed;
      await user.save();

      return true;
    } catch (error) {
      console.error("Error updating user words left:", error);
      return false;
    }
  }

  async updateUserVoice_left(userId) {
    try {
      const existingUser = await User.findByPk(userId);

      if (!existingUser) {
        throw new Error("User not found");
      }

      const currentVoice = existingUser.voice_count || 0;

      if (currentVoice <= 0) {
        throw new Error("Insufficient voice count");
      }

      existingUser.voice_count -= 1; // Decrease the image count
      await existingUser.save();

      return existingUser;
    } catch (error) {
      console.error("Error updating user voices left:", error);
      return false;
    }
  }

  async updatePassword(userId, oldPassword, newPassword) {
    try {
      // Find user by primary key (userId)
      const user = await User.findByPk(userId);
      if (!user) {
        return false; // User not found
      }

      // Check if old password matches the user's current password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return false; // Old password doesn't match
      }

      // Update user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return true; // Password update successful
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  async updateUserInformation(
    email,
    wordsLeft,
    chatCount,
    imageCount,
    planName
  ) {
    try {
      const updatedUser = await User.update(
        {
          words_left: wordsLeft,
          chat_count: chatCount,
          image_count: imageCount,
          plan_name: planName,
        },
        { where: { email } }
      );
      return updatedUser;
    } catch (error) {
      console.error("Error updating user information:", error);
      throw new Error("Error updating user information");
    }
  }
}

module.exports = new UserService();
