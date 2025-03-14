import express from "express";
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  updateUserProfile,
  getUserProfile,
  adminUser,
  getAccessUsers,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

// ROUTE ORDER MATTERS!!!

router.route("/").get(protect, admin, getUsers);

router.post("/auth", authUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/access").get(protect, getAccessUsers);

router
  .route("/:id")
  .get(protect, getUserById)
  .delete(protect, deleteUser)
  .put(protect, updateUser);

router.route("/:id/admin").put(protect, admin, adminUser);
router.route("/:id/block").put(protect, admin, blockUser);
router.route("/:id/unblock").put(protect, admin, unblockUser);

router.route("/create").get(protect);

export default router;
