import asyncHandler from "express-async-handler";
import Order from "../models/Order.models.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { items, totalPrice } = req.body;

  const order = new Order({
    user: req.user._id,
    items,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(orders);
});
