const Plan = require("../models/Plan");

const getAllPlans = async () => {
  try {
    const plans = await Plan.findAll();
    return plans;
  } catch (err) {
    console.error(err);
    throw new Error("Error fetching plans");
  }
};

const getPlanById = async (planId) => {
  try {
    const plan = await Plan.findByPk(planId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    return plan;
  } catch (err) {
    console.error(err);
    throw new Error("Error fetching plan by ID");
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
};
