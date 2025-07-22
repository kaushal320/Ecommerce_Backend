import dotenv from "dotenv";
import cloudinary from "./config/cloudinary.js";
dotenv.config();

import express from "express";

import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
