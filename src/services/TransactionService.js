const Transaction = require("../models/Transaction");

class TransactionService {
  static async createTransaction(transactionData) {
    try {
      const createdTransaction = await Transaction.create(transactionData);
      return createdTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }

  static async getTransactionByStripeId(id) {
    try {
      const transaction = await Transaction.findOne({ where: { id } });
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw new Error("Failed to fetch transaction");
    }
  }

  static async updateTransaction(id, updatedData) {
    try {
      const [affectedCount] = await Transaction.update(updatedData, {
        where: { id },
      });
      return affectedCount > 0;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw new Error("Failed to update transaction");
    }
  }

  static async deleteTransaction(id) {
    try {
      const deletedRows = await Transaction.destroy({ where: { id } });
      return deletedRows > 0;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw new Error("Failed to delete transaction");
    }
  }

  static async getTransactionsByUserId(user_id) {
    try {
      const transactions = await Transaction.findAll({ where: { user_id } });
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }
}

module.exports = TransactionService;
