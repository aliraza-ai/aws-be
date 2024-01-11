const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

const Plan = sequelize.define(
  "Plan",
  {
    plan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    package: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    features: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    modelName: "Plan",
    tableName: "pricing_table",
    sequelize,
    timestamps: false,
  }
);

module.exports = Plan;
