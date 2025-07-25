import asyncHandler from "express-async-handler";
import Category from "../models/Category.models.js";
import slugify from "slugify";

// CREATE Category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive = true } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const existing = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existing) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name,
    description,
    isActive,
    slug: slugify(name, { lower: true }),
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

//  Get only active categories
export const getPublicCategories = asyncHandler(async (req, res) => {
  let { keyword = "", page = 1, limit = 10, sort = "-createdAt" } = req.query;

  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const query = { isActive: true };

  if (keyword.trim()) {
    query.name = { $regex: keyword.trim(), $options: "i" };
  }

  const total = await Category.countDocuments(query);

  const categories = await Category.find(query)
    .sort(sort) // <-- 🔥 sort here
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    categories,
  });
});

//  Get categories with pagination, search, sort, filter
export const getCategories = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "name",
    sortOrder = "asc",
    isActive,
  } = req.query;

  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  // Build query object
  const query = {};

  if (keyword.trim()) {
    // Strict regex search on name only, case-insensitive
    query.name = { $regex: keyword.trim(), $options: "i" };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  // Count total matching documents
  const total = await Category.countDocuments(query);

  // Sorting
  const sortQuery = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // Find matching categories
  const categories = await Category.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    categories,
  });
});

// Get category by slug
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, category });
});

//  UPDATE category
export const updateCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { name, description, isActive } = req.body;

  const category = await Category.findOne({ slug });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true });
  }
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();

  res.json({
    success: true,
    message: "Category updated successfully",
    category: updated,
  });
});

//  DELETE category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOneAndDelete({ slug });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});
