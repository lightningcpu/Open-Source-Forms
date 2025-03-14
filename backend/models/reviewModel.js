import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isLiked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    template_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "templates",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: true,
  }
);

Review.associate = (models) => {
  Review.belongsTo(models.Template, { foreignKey: "template_id" });
  Review.belongsTo(models.User, { foreignKey: "user_id" });
};

export default Review;
