import generateToken from "../utils/generateToken.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import { Op } from "sequelize";

// @desc    Auth user and get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user && (await user.matchPassword(password))) {
    if (user.isBlocked) {
      res.status(403);
      throw new Error("Your account is blocked");
    }

    user.lastLogin = new Date();
    await user.save();

    generateToken(res, user.id);

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      lastLogin: user.lastLogin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    lastLogin: new Date(),
  });

  generateToken(res, user.id);

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isBlocked: user.isBlocked,
    lastLogin: user.lastLogin,
  });
});

// @desc    Log out user
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("operation", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
  });
  res.status(200).json(users);
});

// @desc    Get all users except the requesting user
// @route   GET /api/users/access/:id
// @access  Private
const getAccessUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: {
      id: {
        [Op.ne]: req.user.id,
      },
      isAdmin: false,
    },
    attributes: ["id", "name", "email"],
    order: [["name", "ASC"]],
  });

  const options = users.map((user) => ({
    label: user.name,
    value: user.id,
    email: user.email,
  }));

  res.status(200).json(options);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Admin/unAdmin user
// @route   PUT /api/users/:id/admin
// @access  Private/Admin
const adminUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isAdmin = !user.isAdmin;
  await user.save();
  res.status(200).json({ message: "User privileges updated successfully" });
});

// @desc    Block/block user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isBlocked = true;
  await user.save();
  res.status(200).json({ message: "User blocked successfully" });
});

// @desc    Block/unblock user
// @route   PUT /api/users/:id/unblock
// @access  Private/Admin
const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isBlocked = false;
  await user.save();
  res.status(200).json({ message: "User unblocked successfully" });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.destroy();
  res.status(200).json({ message: "User deleted successfully" });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.body.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.body.id);

  if (user) {
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUsers,
  getAccessUsers,
  getUserById,
  adminUser,
  blockUser,
  unblockUser,
  deleteUser,
  updateUser,
  updateUserProfile,
  getUserProfile,
};
