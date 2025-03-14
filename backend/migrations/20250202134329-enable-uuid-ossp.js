export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For trigram search
      CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP EXTENSION IF EXISTS "unaccent";
      DROP EXTENSION IF EXISTS "pg_trgm";
      DROP EXTENSION IF EXISTS "uuid-ossp";
    `);
  },
};
