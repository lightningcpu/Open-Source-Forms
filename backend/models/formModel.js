import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Form extends Model {}

Form.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    template_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "templates",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Form",
    tableName: "forms",
    timestamps: true,
  }
);

Form.associate = (models) => {
  Form.belongsTo(models.Template, { foreignKey: "template_id" });
  Form.belongsTo(models.User, { foreignKey: "user_id" });
  Form.hasMany(models.Answer, { foreignKey: "form_id" });
};

export default Form;
