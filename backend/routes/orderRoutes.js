import express from "express";
import { createOrder, getUserOrders } from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);

export default router;
