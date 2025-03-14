import { Sequelize } from "sequelize";
import questions from "../data/questions.js";

export default {
  up: async (queryInterface) => {
    const sampleQuestions = questions.map((question) => ({
      ...question,
      id: Sequelize.literal("uuid_generate_v4()"),
    }));

    return queryInterface.bulkInsert("questions", sampleQuestions);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("questions", null, {});
  },
};
