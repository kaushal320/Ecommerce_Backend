import asyncHandler from "express-async-handler";
import Order from "../models/Order.models.js";
import Product from "../models/Product.models.js";

// Create New Order
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice = 0,
    shippingPrice = 0,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Validate each product exists and replace price with DB price
  const validatedOrderItems = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(400);
        throw new Error(`Product not found: ${item.product}`);
      }

      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price, // Use price from DB, not from client
      };
    })
  );

  // Calculate subtotal (sum of price * quantity)
  const subtotal = validatedOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calculate totalPrice (subtotal + tax + shipping)
  const totalPriceCalculated =
    subtotal + Number(taxPrice) + Number(shippingPrice);

  const order = new Order({
    user: req.user._id,
    orderItems: validatedOrderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice: totalPriceCalculated, // Server calculated totalPrice
  });

  const createdOrder = await order.save();

  // Populate user and product details before sending response
  const populatedOrder = await Order.findById(createdOrder._id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price image");

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order: populatedOrder,
  });
});

// Get Orders with pagination, filtering, and sorting
export const getOrders = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    userId,
  } = req.query;

  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const query = {};

  if (userId) {
    query.user = userId;
  }

  const total = await Order.countDocuments(query);

  const sortQuery = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("orderItems.product", "name price image")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    orders,
  });
});

// Get Order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price image");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ success: true, order });
});

// Update Order (mark paid or delivered)
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (req.body.isPaid !== undefined) {
    order.isPaid = req.body.isPaid;
    order.paidAt = req.body.isPaid ? new Date() : null;
    order.paymentResult = req.body.paymentResult || order.paymentResult;
  }

  if (req.body.isDelivered !== undefined) {
    order.isDelivered = req.body.isDelivered;
    order.deliveredAt = req.body.isDelivered ? new Date() : null;
  }

  const updatedOrder = await order.save();

  const populatedOrder = await Order.findById(updatedOrder._id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price image");

  res.json({
    success: true,
    message: "Order updated successfully",
    order: populatedOrder,
  });
});

// Delete Order
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});
