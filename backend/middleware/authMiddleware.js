import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.models.js";

// Middleware to protect private routes
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please login to continue.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or has expired. Please login again.",
    });
  }
});

// Middleware to restrict access to admin users
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
});
