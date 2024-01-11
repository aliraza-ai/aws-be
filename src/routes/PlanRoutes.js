const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/PlanController');

// Fetch all plans
router.get('/', PlanController.getPlans);

module.exports = router;