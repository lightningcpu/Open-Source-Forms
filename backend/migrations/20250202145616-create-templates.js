export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("templates", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      search_vector: {
        type: Sequelize.TSVECTOR,
        allowNull: true,
      },
      access: {
        type: Sequelize.ENUM("public", "restricted"),
        allowNull: false,
        defaultValue: "public",
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS templates_search_vector_update ON templates;
      DROP FUNCTION IF EXISTS templates_search_vector_trigger;
    `);
    await queryInterface.dropTable("templates");
  },
};
