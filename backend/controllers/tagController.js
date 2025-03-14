import sequelize from "../config/db.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Tag from "../models/tagModel.js";
import Template from "../models/templateModel.js";

// @desc    Fetch all tags
// @route   /api/tags
// @access  Public
const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.findAll({
    attributes: [["id", "value"], "label"],
    order: [["label", "ASC"]],
  });
  res.status(200).json(tags);
});

// @desc    Fetch tag cloud
// @route   /api/tags/cloud
// @access  Public
const getTagCloud = asyncHandler(async (req, res) => {
  const tags = await Tag.findAll({
    attributes: [
      ["label", "value"],
      [
        sequelize.fn(
          "COUNT",
          sequelize.fn("DISTINCT", sequelize.col("Templates.id"))
        ),
        "count",
      ],
    ],
    include: [
      {
        model: Template,
        attributes: [],
        through: { attributes: [] }, // Exclude join table columns
      },
    ],
    group: ["Tag.id", "Tag.label"], // Group by all non-aggregated Tag fields
    order: [["value", "ASC"]],
  });

  res.status(200).json(tags);
});

export { getTags, getTagCloud };
