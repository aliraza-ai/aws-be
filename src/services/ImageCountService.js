const  User  = require("../models/User");

class ImageCountService {
  async updateImageCount(userId, reduceAmount) {
    try {
      const existingUser = await User.findByPk(userId);

      if (!existingUser) {
        throw new Error("User not found");
      }

      const currentImageCount = existingUser.image_count || 0;

      if (currentImageCount < reduceAmount) {
        throw new Error("Insufficient image count");
      }

      existingUser.image_count -= reduceAmount; // Decrease the image count
      await existingUser.save();

      return existingUser;
    } catch (error) {
      throw error;
    }
  }

  async getImageCount(userId) {
    try {
      const existingUser = await User.findByPk(userId);

      if (!existingUser) {
        throw new Error("User not found");
      }

      return { image_count: existingUser.image_count || 0 };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ImageCountService();
