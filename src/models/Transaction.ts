import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/dbConfig";
import User from "./User";

interface TransactionAttributes {
  id: number;
  user_id: number;
  name: string;
  stripe_id: string;
  plan_id: number;
  created_at: Date;
  updated_at: Date;
}

class Transaction
  extends Model<TransactionAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public user_id!: number;
  public name!: string;
  public stripe_id!: string;
  public plan_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "subscriptions",
    timestamps: false,
  }
);

Transaction.belongsTo(User, { foreignKey: "user_id" });

export default Transaction;
