import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "Stripe secret key is not defined in the environment variables"
  );
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: null as any,
});

export default stripe;
