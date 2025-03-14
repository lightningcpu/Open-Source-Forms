import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Template extends Model {}

Template.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Education", "Quiz", "Poll", "Job Application", "Other"]],
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    access: {
      type: DataTypes.ENUM("public", "restricted"),
      allowNull: false,
      defaultValue: "public",
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Template",
    tableName: "templates",
  }
);

Template.associate = (models) => {
  Template.belongsTo(models.User, { foreignKey: "authorId" });
  Template.hasMany(models.Question, { foreignKey: "template_id" });
  Template.hasMany(models.Form, { foreignKey: "template_id" });
  Template.hasMany(models.Review, { foreignKey: "template_id" });
  Template.belongsToMany(models.User, {
    through: "template_access",
    foreignKey: "template_id",
    otherKey: "user_id",
    as: "AllowedUsers",
  });
  Template.belongsToMany(models.Tag, {
    through: "template_tags",
    foreignKey: "template_id",
    otherKey: "tag_id",
  });
};

export default Template;
