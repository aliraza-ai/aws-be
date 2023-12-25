import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import userController from "./controllers/UserController";
import { testDBConnection } from "./config/dbConfig";
import contactRoutes from "./routes/contactRoutes";
import OpenAIRoutes from "./routes/OpenAIRoutes";
import subscriptionRoutes from "./routes/SubscriptionRoutes";

const app = express();

app.use(express.json());

const port = process.env.PORT || 4001;

// Configure CORS based on environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (error: Error | null, allowed?: boolean) => void
  ) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Check database connection
testDBConnection();

// Define a simple route
app.get("/sandbox", (req: Request, res: Response) => {
  res.send("Hello, welcome to your Express server!");
});

// Define user routes
app.use("/sandbox/users", userController);

// Define contact routes
app.use("/sandbox/contacts", contactRoutes);

// Define openAi routes
app.use("/sandbox/intelliAI", OpenAIRoutes);

// Define stripe routes
app.use("/sandbox/subscriptions", subscriptionRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
