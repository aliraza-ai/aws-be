import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig";
import User from "./User";

class Subscription extends Model {
  // Your Subscription model definition here
}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "subscription",
    timestamps: false,
    underscored: true,
    indexes: [
    ],
  }
);

export default Subscription;
