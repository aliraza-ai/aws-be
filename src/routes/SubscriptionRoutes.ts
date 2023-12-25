import express from "express";
import Subscription from "../models/Subscription";
import User from "../models/User";
import verifyToken from "../config/middleware";

const router = express.Router();

router.get("/subscriptions", verifyToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.body.user_id },
      include: [User],
    });

    res.status(200).json({ subscriptions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

export default router;
