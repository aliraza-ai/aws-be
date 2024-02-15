const UpdatePlanService = require("../services/UpdatePlanService");

class UpdatePlanController {
  static async updatePlan(req, res) {
    try {
      const { userId, planName, words, chats, images } = req.body;

      const updated = await UpdatePlanService.updatePlan(
        userId,
        planName,
        words,
        chats,
        images
      );

      if (updated) {
        res.status(200).json({ message: "User plan updated successfully" });
      } else {
        res.status(404).json({ message: "User not found!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = UpdatePlanController;
