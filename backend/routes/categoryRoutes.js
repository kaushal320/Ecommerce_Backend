// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getCategories,
} from "../controller/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCategory);
router.get("/", getCategories);

export default router;
