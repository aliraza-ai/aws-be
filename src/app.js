const express = require("express");
const cors = require("cors");
const userController = require("./controllers/UserController");
const { testDBConnection } = require("./config/dbConfig");
const contactRoutes = require("./routes/contactRoutes");
const OpenAIRoutes = require("./routes/OpenAIRoutes");
const TransactionsRoutes = require("./routes/TransactionRoutes");

const app = express();

app.use(express.json());

const port = process.env.PORT || 4001;

// Configure CORS based on environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const corsOptions = {
  origin: function (origin, callback) {
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
app.get("/sandbox", (req, res) => {
  res.send("Hello, welcome to your Express server!");
});

// Define user routes
app.use("/sandbox/users", userController);

// Define contact routes
app.use("/sandbox/contacts", contactRoutes);

// Define openAi routes
app.use("/sandbox/intelliAI", OpenAIRoutes);

// Define stripe routes
app.use("/sandbox", TransactionsRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
