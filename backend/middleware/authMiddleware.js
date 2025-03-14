import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.operation;

  if (!token) {
    const error = new Error("Not authorized, token missing.");
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      const error = new Error("User does not exist.");
      error.statusCode = 401;
      throw error;
    }

    if (user.isBlocked) {
      const error = new Error("Account blocked.");
      error.statusCode = 403;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    const error = new Error("Not authorized as admin.");
    error.statusCode = 403;
    throw error;
  }
};
export { protect, admin };
