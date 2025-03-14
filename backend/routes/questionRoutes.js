import express from "express";
import {
  createQuestion,
  deleteQuestion,
  editQuestionById,
  getQuestionById,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(createQuestion).put(editQuestionById);
router.route("/:id").get(getQuestionById).delete(protect, deleteQuestion);

export default router;
