import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Tag extends Model {}

Tag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "tags",
  }
);

Tag.associate = (models) => {
  Tag.belongsToMany(models.Template, {
    through: "template_tags",
    foreignKey: "tag_id",
    otherKey: "template_id",
  });
};

export default Tag;
