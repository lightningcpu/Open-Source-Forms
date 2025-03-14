import asyncHandler from "../middleware/asyncHandler.js";
import Question from "../models/questionModel.js";
import Template from "../models/templateModel.js"; // Import the Template model

// @desc    Fetch question by question ID
// @route   /api/questions/:id
// @access  Public
const getQuestionById = asyncHandler(async (req, res) => {
  const question_id = req.params.id;

  const question = await Question.findByPk(question_id);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.status(200).json(question);
});

// @desc    Create Question
// @route   POST /api/questions
// @access  Private
const createQuestion = asyncHandler(async (req, res) => {
  const { title, description, type, index, show_in_results, template_id } =
    req.body;

  const question = await Question.create({
    title,
    description,
    type,
    index,
    show_in_results,
    template_id,
  });

  res.status(201).json({
    id: question.id,
    title: question.title,
    description: question.description,
    type: question.type,
    index: question.index,
    show_in_results: question.show_in_results,
    template_id: question.template_id,
  });
});

// @desc    Edit Question By Id
// @route   PUT /api/questions
// @access  Private
const editQuestionById = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    index,
    show_in_results,
    id: questionId,
  } = req.body;

  const question = await Question.findByPk(questionId);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  const updateData = {
    title: title !== undefined ? title : question.title,
    description: description !== undefined ? description : question.description,
    type: type !== undefined ? type : question.type,
    index: index !== undefined ? index : question.index,
    show_in_results:
      show_in_results !== undefined
        ? show_in_results
        : question.show_in_results,
  };

  await question.update(updateData);

  res.status(201).json({
    id: question.id,
    title: question.title,
    description: question.description,
    type: question.type,
    index: question.index,
    show_in_results: question.show_in_results,
    template_id: question.template_id,
  });
});

// @desc    Delete Question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByPk(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  await question.destroy();
  res.status(200).json({ message: "Question deleted successfully" });
});

export { getQuestionById, createQuestion, editQuestionById, deleteQuestion };
