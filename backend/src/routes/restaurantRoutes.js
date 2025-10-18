import express from "express";
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  deleteAllRestaurants,
} from "../controllers/restaurantController.js";

import {
  addFoodItem,
  getAllFoodByRestaurant,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";

import { search } from "../controllers/searchController.js";
import upload from "../middleware/upload.js"; // Multer config
import { protect, customerOnly } from "../middleware/authMiddleware.js";
import { ownerOnly, adminOnly } from "../middleware/roleMiddleware.js";
import { getAvailableTables } from "../controllers/bookingController.js"; // Table availability

const router = express.Router();

/* ================================
 🔍 SEARCH
================================ */
router.get("/search", search);

/* ================================
 📋 RESTAURANTS
================================ */
// Get all restaurants (Public)
router.get("/", getRestaurants);

// Get single restaurant by ID (Public)
router.get("/:id", getRestaurantById);

// Customer-safe route: Get table availability for a restaurant
router.get("/:id/availability", protect, customerOnly, getAvailableTables);

// Create restaurant (Owner only)
router.post(
  "/",
  protect,
  ownerOnly,
  upload.fields([
    { name: "restaurantImage", maxCount: 1 },
    { name: "foodImages", maxCount: 10 },
  ]),
  createRestaurant
);

// Update restaurant (Owner only)
router.put(
  "/:id",
  protect,
  ownerOnly,
  upload.fields([
    { name: "restaurantImage", maxCount: 1 },
    { name: "foodImages", maxCount: 10 },
  ]),
  updateRestaurant
);

// Delete a restaurant (Owner only)
router.delete("/:id", protect, ownerOnly, deleteRestaurant);

// Delete ALL restaurants (Admin only)
router.delete("/", protect, adminOnly, deleteAllRestaurants);

/* ================================
 🍽️ FOOD ITEMS (Nested under Restaurant)
================================ */
// Add new food (Owner only)
router.post(
  "/:restaurantId/foods",
  protect,
  ownerOnly,
  upload.single("image"),
  addFoodItem
);

// Get all foods for a restaurant (Public)
router.get("/:restaurantId/foods", getAllFoodByRestaurant);

// Update food item (Owner only)
router.put(
  "/foods/:id",
  protect,
  ownerOnly,
  upload.single("image"),
  updateFood
);

// Delete food item (Owner only)
router.delete("/foods/:id", protect, ownerOnly, deleteFood);

export default router;
