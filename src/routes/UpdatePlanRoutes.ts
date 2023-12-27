// UserRoutes.ts
import express from "express";
import UpdatePlanController from "../controllers/UpdatePlanController";

const router = express.Router();

router.put("/updatePlan", UpdatePlanController.updatePlan);

export default router;
