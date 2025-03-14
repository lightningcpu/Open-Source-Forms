export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("template_tags", {
      tag_id: {
        type: Sequelize.UUID,
        references: { model: "tags", key: "id" },
        onDelete: "CASCADE",
      },
      template_id: {
        type: Sequelize.UUID,
        references: { model: "templates", key: "id" },
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
    await queryInterface.dropTable("template_tags");
  },
};
