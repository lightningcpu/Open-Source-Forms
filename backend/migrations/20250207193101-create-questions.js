export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("questions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          "SINGLE_LINE",
          "MULTI_LINE",
          "INTEGER",
          "CHECKBOX"
        ),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      index: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      show_in_results: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "templates",
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
    await queryInterface.dropTable("questions");
  },
};
