const express = require("express");
const cors = require("cors");
const userController = require("./controllers/UserController");
const { testDBConnection } = require("./config/dbConfig");
const contactRoutes = require("./routes/contactRoutes");
const OpenAIRoutes = require("./routes/OpenAIRoutes");
const VoiceAPIRoutes = require("./routes/VoiceAPIRoutes");

const TransactionsRoutes = require("./routes/TransactionRoutes");
const planRoutes = require("./routes/PlanRoutes");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.json());

const port = process.env.PORT || 7000;

// Configure CORS
app.use(cors());

app.use(bodyParser.raw({ type: "application/json" }));

// Check database connection
testDBConnection();

// Define a simple route
app.get("/sandbox", (req, res) => {
  res.send("Hello, welcome to your Express server!");
});

// Define user routes
app.use("/sandbox/users", userController);

// Define contact routes
app.use("/sandbox/contacts", contactRoutes);

// Define openAi routes
app.use("/sandbox/intelliAI", OpenAIRoutes);

app.use("/sandbox/intelli-apis", VoiceAPIRoutes);

// Define stripe routes
app.use("/sandbox", TransactionsRoutes);

// Define plans routes
app.use("/sandbox/plans", planRoutes);

// Define webhook routes
const endpointSecret = process.env.endpointSecret;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
