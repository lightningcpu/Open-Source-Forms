import templates from "../data/templates.js";

export default {
  up: async (queryInterface) => {
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE "isAdmin" = true LIMIT 1;`
    );

    const sampleTemplates = templates.map((template) => ({
      ...template,
      authorId: adminUser[0].id,
    }));

    return queryInterface.bulkInsert("templates", sampleTemplates);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("templates", null, {});
  },
};
