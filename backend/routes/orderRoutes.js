import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controller/orderController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createOrder) // only authenticated users can create
  .get(protect, admin, getOrders); // admin can see all orders

router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, admin, updateOrder)
  .delete(protect, admin, deleteOrder);

export default router;
