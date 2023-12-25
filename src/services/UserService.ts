import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

class UserService {
  public async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<User | null> {
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

  public async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  public async comparePasswords(
    inputPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  public async initiatePasswordReset(email: string): Promise<string | null> {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return null; // User not found
      }
      const reset_token = jwt.sign(
        { email },
        process.env.JWT_RESET_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      // Store the reset token in the database or associate it with the user
      user.reset_token = reset_token;
      await user.save();

      return reset_token;
    } catch (error) {
      console.error("Error initiating password reset:", error);
      return null;
    }
  }

  // Get User
  public async findUserDetailsById(userId: number): Promise<User | null> {
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
        ],
      });
      return user;
    } catch (error) {
      console.error("Error finding user details by ID:", error);
      return null;
    }
  }

  // Update User
  public async updateUser(
    userId: number,
    updatedData: Partial<User>
  ): Promise<User | null> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return null;
      }

      // Update specific user details with provided data
      const { id, name, email, password, phone_number, address } = updatedData;

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

      await user.save();

      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  // Delete user
  public async deleteUser(userId: number): Promise<boolean> {
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

  public async resetPassword(
    email: string,
    reset_token: string,
    newPassword: string
  ): Promise<boolean> {
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

  public async findUserById(userId: number): Promise<User | null> {
    try {
      const user = await User.findByPk(userId);
      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  public async updateUserwords_left(
    userId: number,
    wordsUsed: number
  ): Promise<boolean> {
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
}

export default new UserService();
