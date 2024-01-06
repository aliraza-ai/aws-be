const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

class User extends Model {
  // Define the model attributes
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
      defaultValue: 2000,
    },
    chat_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    image_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    short_bio: {
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

module.exports = User;
