import express from "express";
import {
  createTemplate,
  createTemplateReview,
  deleteTemplate,
  updateTemplateById,
  getTemplateById,
  getTemplates,
  getTemplatesByAuthorId,
} from "../controllers/templateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/author").get(protect, getTemplatesByAuthorId);
router.route("/create").post(protect, createTemplate);
router.route("/").get(getTemplates).put(protect, updateTemplateById);

router.route("/:id").get(getTemplateById).delete(protect, deleteTemplate);
router.route("/:id/reviews").post(protect, createTemplateReview);

export default router;
