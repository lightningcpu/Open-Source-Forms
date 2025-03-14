import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Answer extends Model {}

Answer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    form_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "forms",
        key: "id",
      },
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "questions",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Answer",
    tableName: "answers",
    timestamps: true,
  }
);

Answer.associate = (models) => {
  Answer.belongsTo(models.Form, { foreignKey: "form_id" });
  Answer.belongsTo(models.Question, { foreignKey: "question_id" });
};

export default Answer;
