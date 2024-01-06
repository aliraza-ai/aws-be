const { DataTypes, Model, Optional } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

// Define the attributes for Contact model
const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    modelName: "Contact",
    tableName: "contacts",
    sequelize,
  }
);

module.exports = Contact;
