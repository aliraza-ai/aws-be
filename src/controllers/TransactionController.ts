import { Request, Response } from "express";
import TransactionService from "../services/TransactionService";

class TransactionController {
  static async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, name, id, plan_id } = req.body;

      // Check if the id already exists
      const existingTransaction =
        await TransactionService.getTransactionByStripeId(id);
      if (existingTransaction) {
        res.status(400).json({ message: "Stripe ID already exists" });
        return;
      }

      const transactionData = {
        user_id,
        name,
        id,
        plan_id,
      };

      const transaction = await TransactionService.createTransaction(
        transactionData
      );

      if (transaction) {
        res
          .status(201)
          .json({ message: "Transaction created successfully", transaction });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get the transactions
  static async getTransactionByStripeId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await TransactionService.getTransactionByStripeId(id);

      if (transaction) {
        res.status(200).json({ message: "Transaction found", transaction });
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get transaction by user_id
  static async getTransactionsByUserId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { user_id } = req.params;
      const userIdAsNumber = parseInt(user_id, 10);

      const transactions = await TransactionService.getTransactionsByUserId(
        userIdAsNumber
      );

      if (transactions.length > 0) {
        res.status(200).json({ message: "Transactions found", transactions });
      } else {
        res
          .status(404)
          .json({ message: "Transactions not found for this user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  //   Update the transactions
  static async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { user_id, name, plan_id } = req.body;

      const transactionData = {
        user_id,
        name,
        plan_id,
      };

      const updatedTransaction = await TransactionService.updateTransaction(
        id,
        transactionData
      );

      if (updatedTransaction) {
        res.status(200).json({
          message: "Transaction updated successfully",
          updatedTransaction,
        });
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  //   Delete transaction
  static async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await TransactionService.deleteTransaction(id);

      if (deleted) {
        res.status(200).json({ message: "Transaction deleted successfully" });
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default TransactionController;
