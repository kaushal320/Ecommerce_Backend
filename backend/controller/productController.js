import asyncHandler from "express-async-handler";
import Product from "../models/Product.models.js";
import cloudinary from "../config/cloudinary.js";
import path from "path";
import fs from "fs/promises";

// === Get All Products ===
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch products",
    });
  }
});

// === Create New Product ===
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
      res.status(400);
      throw new Error("Please fill all required fields");
    }

    let imageUrl = "";
    let imagePublicId = "";
    if (req.file) {
      const absolutePath = path.resolve(req.file.path);
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: "ecommerce/products",
        resource_type: "image",
      });
       imagePublicId = result.public_id;
      imageUrl = result.secure_url;
      await fs.unlink(req.file.path); // cleanup temp file
    }

    const product = new Product({
      name,
      imagePublicId,
      description,
      price,
      category,
      stock,
      image: imageUrl,
      createdBy: req.user._id, // must be coming from protected route
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: createdProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create product",
    });
  }
});
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Optional: Update fields only if provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    if (req.file) {
      const absolutePath = path.resolve(req.file.path);
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: "ecommerce/products",
        resource_type: "image",
      });
      product.image = result.secure_url;
      await fs.unlink(req.file.path); // cleanup temp file
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update product",
    });
  }
});
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await Product.deleteOne({ _id: productId });
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete product",
    });
  }
});
