import express from "express";
import { addFoodItem, getAllFoodByRestaurant, updateFood, deleteFood, searchFood } from "../controllers/foodController.js";

const router = express.Router();

//food item routes
router.post("/", addFoodItem);
router.get("/restaurant/:restaurantId", getAllFoodByRestaurant);
router.put("/:id", updateFood);
router.delete("/:id", deleteFood);

//food search route
router.get("/search", searchFood);

export default router;