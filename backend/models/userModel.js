import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

class User extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
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
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("email")) {
          const existingUser = await User.findOne({
            where: { email: user.email },
          });
          if (existingUser && existingUser.isBlocked) {
            throw new Error("This email is blocked.");
          }
        }

        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.associate = (models) => {
  User.hasMany(models.Template, { foreignKey: "authorId", as: "templates" });
  User.hasMany(models.Form, { foreignKey: "user_id" });
  User.hasMany(models.Review, { foreignKey: "user_id" });
  User.belongsToMany(models.Template, {
    through: "template_access",
    foreignKey: "user_id",
    otherKey: "template_id",
    as: "AccessibleTemplates",
  });
};

export default User;
