import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";
import { upload } from "../config/multer.js";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", getProducts);
router.post("/", protect, admin, upload.single("image"), createProduct);
router.put("/:id", protect, admin, upload.single("image"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
export default router;
