import { Request, Response } from "express";
import UpdatePlanService from "../services/UpdatePlanService";

class UpdatePlanController {
  static async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { userId, wordsLeft, chatCount } = req.body;

      const updated = await UpdatePlanService.updatePlan(
        userId,
        wordsLeft,
        chatCount
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

export default UpdatePlanController;
