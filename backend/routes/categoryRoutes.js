import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
  getPublicCategories,
} from "../controller/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get only active categories (for users or frontend site)
router.get("/public", getPublicCategories);

// Get all categories (with search, sort, pagination)
router.get("/", protect, admin, getCategories);

// Create a new category
router.post("/", protect, admin, createCategory);

// Public/Admin: Get category by slug
router.get("/:slug", getCategoryBySlug);

// Update category by slug
router.put("/:slug", protect, admin, updateCategory);

// Delete category by slug
router.delete("/:slug", protect, admin, deleteCategory);
export default router;
