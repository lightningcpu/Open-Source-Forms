import { Sequelize } from "sequelize";
import users from "../data/users.js";

export default {
  up: async (queryInterface) => {
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        id: Sequelize.literal("uuid_generate_v4()"),
        password: user.password,
        lastLogin: new Date(),
      }))
    );

    return queryInterface.bulkInsert("users", hashedUsers);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("users", null, {});
  },
};
