// controllers/categoryController.js
import asyncHandler from "express-async-handler";
import Category from "../models/Category.models.js";
import slugify from "slugify";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name,
    description,
    slug: slugify(name),
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json({ success: true, categories });
});
