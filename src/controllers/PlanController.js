const PlanService = require("../services/PlanService");

const getPlans = async (req, res) => {
  try {
    const plans = await PlanService.getAllPlans();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

const getPlanById = async (req, res) => {
  try {
    const planId = req.params.id;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const plan = await PlanService.getPlanById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

module.exports = {
  getPlans,
  getPlanById,
};
