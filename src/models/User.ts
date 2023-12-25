import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/dbConfig";

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public reset_token!: string | null;
  public words_left!: number;
  public phone_number!: string | null;
  public address!: string | null;

  static associate(models: any) {
    // Define associations if any
  }
}

User.init(
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    words_left: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3000,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
  }
);

export default User;
