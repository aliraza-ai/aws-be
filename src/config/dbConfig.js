const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Database configuration
const sequelize = new Sequelize({
  database: process.env.DB_NAME || "intelliwriter_latest",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  host: process.env.DB_HOST || "localhost",
  // database: process.env.DB_NAME || "intelliwriter",
  // username: process.env.DB_USER,
  // password: process.env.DB_PASS,
  // host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  dialect: "mysql",
});

async function testDBConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = { sequelize, testDBConnection };
