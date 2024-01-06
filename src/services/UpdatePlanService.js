const User = require("../models/User");

class UpdatePlanService {
  static async updatePlan(userId, wordsLeft, chatCount) {
    try {
      const [updatedRows] = await User.update(
        { words_left: wordsLeft, chat_count: chatCount },
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
