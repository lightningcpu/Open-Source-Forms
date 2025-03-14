import express from "express";
import { getTagCloud, getTags } from "../controllers/tagController.js";

const router = express.Router();

router.route("/cloud").get(getTagCloud);
router.route("/").get(getTags);

export default router;
