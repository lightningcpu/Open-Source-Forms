import asyncHandler from "../middleware/asyncHandler.js";
import Template from "../models/templateModel.js";
import Question from "../models/questionModel.js";
import Tag from "../models/tagModel.js";
import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";

// @desc    Fetch all templates
// @route   /api/templates
// @access  Public
const getTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.findAll({
    include: [
      {
        model: Tag,
        attributes: [["id", "value"], "label"],
        through: { attributes: [] },
      },
      {
        model: User,
        as: "AllowedUsers",
        attributes: [["id", "value"], ["name", "label"], "email"],
        through: { attributes: [] },
      },
    ],
  });
  res.status(200).json(templates);
});

// @desc    Fetch template by template ID
// @route   /api/templates/:id
// @access  Public
const getTemplateById = asyncHandler(async (req, res) => {
  const template_id = req.params.id;

  const template = await Template.findByPk(template_id, {
    include: [
      {
        model: Tag,
        attributes: [["id", "value"], "label"],
        through: { attributes: [] },
      },
      {
        model: User,
        as: "AllowedUsers",
        attributes: [["id", "value"], ["name", "label"], "email"],
        through: { attributes: [] },
      },
      {
        model: Question,
        attributes: [
          "id",
          "type",
          "title",
          "description",
          "index",
          "show_in_results",
        ],
      },
      {
        model: Review,
        attributes: ["id", "name", "isLiked", "comment", "createdAt"],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
    order: [[Question, "index", "ASC"]],
  });

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  if (template.Tags) {
    template.Tags.sort((a, b) => a.label.localeCompare(b.label));
  }

  res.status(200).json(template);
});

// @desc    Fetch template by author ID
// @route   GET /api/templates/author
// @access  Private
const getTemplatesByAuthorId = asyncHandler(async (req, res) => {
  if (req.user.isAdmin) {
    const templates = await Template.findAll({});
    res.status(200).json(templates);
  } else {
    const templates = await Template.findAll({
      where: { authorId: req.user.id },
    });
    res.status(200).json(templates);
  }
});

// @desc    Create template
// @route   POST /api/templates/create
// @access  Private
const createTemplate = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    topic,
    image,
    access,
    authorId,
    questionList,
    tagList,
  } = req.body;

  if (!title || !authorId || !questionList) {
    res.status(400);
    throw new Error("Missing required fields: title, questions, or authorId");
  }

  const template = await Template.create({
    title,
    description: description || "",
    topic: topic || "Other",
    image:
      image ||
      "https://img.freepik.com/free-vector/cerulean-blue-curve-frame-template-vector_53876-136094.jpg",
    access: access || "public",
    authorId,
  });

  const questionsData = questionList.map((q, index) => ({
    type: q.type,
    title: q.title,
    description: q.description || "",
    index: index,
    show_in_results: q.displayOnTable,
    template_id: template.id,
  }));

  await Question.bulkCreate(questionsData);

  const tagInstances = await Promise.all(
    tagList.map(async (tag) => {
      const [foundTag] = await Tag.findOrCreate({
        where: { label: tag.label },
        defaults: { label: tag.label },
      });
      return foundTag;
    })
  );

  await template.addTags(tagInstances);

  res.status(201).json({
    ...template.toJSON(),
  });
});

// @desc    Edit template
// @route   PUT /api/templates
// @access  Private
const updateTemplateById = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    topic,
    image,
    access,
    templateId,
    tagList,
    userAccess,
  } = req.body;

  const template = await Template.findByPk(templateId, {
    include: [
      {
        model: Tag,
        attributes: ["id", "label"],
        through: { attributes: [] },
      },
      {
        model: User,
        as: "AllowedUsers",
        attributes: ["id", "name", "email"],
        through: { attributes: [] },
      },
    ],
  });

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  const updateData = {
    title: title !== undefined ? title : template.title,
    description: description !== undefined ? description : template.description,
    topic: topic !== undefined ? topic : template.topic,
    image: image !== undefined ? image : template.image,
    access: access !== undefined ? access : template.access,
  };

  if (tagList) {
    const existingTags = template.Tags.map((tag) => tag.label);
    const newTagNames = tagList.map((tag) => tag.label);
    const tagsToRemove = existingTags.filter(
      (tag) => !newTagNames.includes(tag)
    );

    if (tagsToRemove.length > 0) {
      const tagsToRemoveInstances = await Tag.findAll({
        where: { label: tagsToRemove },
      });
      await template.removeTags(tagsToRemoveInstances);
    }

    const tagInstances = await Promise.all(
      newTagNames.map(async (tagName) => {
        const [tag] = await Tag.findOrCreate({ where: { label: tagName } });
        return tag;
      })
    );

    await template.setTags(tagInstances);
  }

  if (userAccess) {
    const userAccessArray = Array.isArray(userAccess) ? userAccess : [];
    const existingUserIds = template.AllowedUsers.map((user) => user.id);
    const newUserIds = userAccessArray.map((user) => user.value);
    const usersToRemove = existingUserIds.filter(
      (id) => !newUserIds.includes(id)
    );

    if (usersToRemove.length > 0) {
      const usersToRemoveInstances = await User.findAll({
        where: { id: usersToRemove },
      });
      await template.removeAllowedUsers(usersToRemoveInstances);
    }

    const userInstances = await Promise.all(
      newUserIds.map(async (id) => {
        const user = await User.findByPk(id);
        return user;
      })
    );

    await template.setAllowedUsers(userInstances);
  }

  await template.update(updateData);

  res.status(200).json(template);
});

// @desc    Create template review
// @route   POST /api/templates/:id/reviews
// @access  Private
const createTemplateReview = asyncHandler(async (req, res) => {
  const { isLiked, comment } = req.body;
  const template_id = req.params.id;

  const template = await Template.findByPk(template_id);

  if (template) {
    const alreadyReviewed = await Review.findOne({
      where: {
        user_id: req.user.id,
        template_id: template_id,
      },
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Template already reviewed.");
    }

    const review = await Review.create({
      name: req.user.name,
      isLiked,
      comment,
      user_id: req.user.id,
      template_id,
    });

    template.likes = template.likes + (isLiked ? 1 : 0);

    await template.save();

    res.status(201).json(review);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
const deleteTemplate = asyncHandler(async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);

    if (!template) {
      res.status(404);
      throw new Error("Template not found");
    }

    await template.destroy();
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error); // Log the error
    res
      .status(404)
      .json({ message: "Failed to delete template", error: error.message });
  }
});

export {
  getTemplates,
  getTemplateById,
  getTemplatesByAuthorId,
  createTemplate,
  updateTemplateById,
  createTemplateReview,
  deleteTemplate,
};
