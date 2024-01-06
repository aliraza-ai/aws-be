const express = require("express");
const UpdatePlanController = require("../controllers/UpdatePlanController");

const router = express.Router();

router.put("/updatePlan", UpdatePlanController.updatePlan);

module.exports = router;
