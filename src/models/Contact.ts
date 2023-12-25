import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/dbConfig";

interface ContactAttributes {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Some attributes are optional in `Contact.build` and `Contact.create` calls
interface ContactCreationAttributes extends Optional<ContactAttributes, "id"> {}

class Contact
  extends Model<ContactAttributes, ContactCreationAttributes>
  implements ContactAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public subject!: string;
  public message!: string;

  // Timestamps are optional if `sequelize` options are provided
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
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
    sequelize,
    modelName: "Contact",
    tableName: "contacts",
  }
);

export default Contact;
