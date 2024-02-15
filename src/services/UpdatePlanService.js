const User = require("../models/User");

class UpdatePlanService {
  static async updatePlan(userId,
    planName,
    words,
    chats,
    images) {
    try {
      const [updatedRows] = await User.update(
        {
          plan_name: planName,
          words_left: words,
          chat_count: chats,
          image_count: images
        },
        {
          where: { user_id: userId },
        }
      );
      
      return updatedRows > 0;
    } catch (error) {
      console.error("Error updating user plan:", error);
      throw new Error("Failed to update user plan");
    }
  }
}

module.exports = UpdatePlanService;
