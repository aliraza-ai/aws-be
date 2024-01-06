const express = require("express");
const TransactionController = require("../controllers/TransactionController");
const verifyToken = require("../config/middleware");

const router = express.Router();

// Create a transaction
router.post(
  "/transactions",
  verifyToken,
  TransactionController.createTransaction
);

// Update a transaction
router.put(
  "/transactions/:id",
  verifyToken,
  TransactionController.updateTransaction
);

// Delete a transaction
router.delete(
  "/transactions/:id",
  verifyToken,
  TransactionController.deleteTransaction
);

// Get a transaction by id
router.get(
  "/transactions/:id",
  verifyToken,
  TransactionController.getTransactionByStripeId
);

// Get transactions by user_id
router.get(
  "/transactions/user/:user_id",
  verifyToken,
  TransactionController.getTransactionsByUserId
);

module.exports = router;
