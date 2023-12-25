import { Request, Response } from "express";
import stripe from "../config/stripeConfig";
import Subscription from "../models/Subscription";
import { sequelize } from "../config/dbConfig";

export const purchaseSubscription = async (req: Request, res: Response) => {
  const { userId, stripeToken, planId, amount } = req.body;

  try {
    const customer = await stripe.customers.create({
      source: stripeToken,
      email: req.body.email,
    });

    const charge = await stripe.charges.create({
      amount: Number(amount) * 100,
      currency: "usd",
      customer: customer.id,
      description: "Subscription purchase",
    });

    const transaction = await sequelize.transaction();

    try {
      const subscription = await Subscription.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          stripe_id: customer.id,
          // Include other subscription details here
        },
        transaction, // Pass the transaction to maintain atomicity
      });

      await transaction.commit(); // Commit the transaction

      res.status(200).json({ message: "Subscription purchased successfully!" });
    } catch (error) {
      await transaction.rollback(); // Rollback the transaction on error
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "An error occurred" });
  }
};
