import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFullImageUrl(req, imagePath) {
  if (!imagePath) {
    return `${req.protocol}://${req.get("host")}/uploads/default.png`;
  }
  if (!imagePath.startsWith("/")) imagePath = "/" + imagePath;
  return `${req.protocol}://${req.get("host")}${imagePath}`;
}

/**
 * @desc Add a new food item to a restaurant
 * @route POST /api/foods
 */
export async function addFoodItem(req, res) {
  try {
    const { restaurantId, name, description, price, category } = req.body;

    if (!restaurantId || !name || !price) {
      return res
        .status(400)
        .json({ message: "Restaurant ID, name, and price are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";

    const food = new Food({
      name: name.trim(),
      description: description ? description.trim() : "",
      price: parseFloat(price),
      category: category ? category.trim() : "Uncategorized",
      restaurant: restaurantId,
      image,
    });

    await food.save();

    res.status(201).json({
      message: "Food item added successfully",
      food: {
        ...food.toObject(),
        image: getFullImageUrl(req, food.image),
      },
    });
  } catch (error) {
    console.error(" Error adding food item:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

/**
 * @desc Get all food items for a restaurant
 * @route GET /api/foods/restaurant/:restaurantId
 */
export async function getAllFoodByRestaurant(req, res) {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const foods = await Food.find({ restaurant: restaurantId });

    res.status(200).json(
      foods.map((f) => ({
        ...f.toObject(),
        image: getFullImageUrl(req, f.image),
      }))
    );
  } catch (error) {
    console.error(" Error fetching food items:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

/**
 * @desc Get all food items for a restaurant (NEW ROUTE)
 * @route GET /api/foods/:restaurantId
 */
export async function getFoodsByRestaurantId(req, res) {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const foods = await Food.find({ restaurant: restaurantId });

    res.status(200).json(
      foods.map((f) => ({
        ...f.toObject(),
        image: getFullImageUrl(req, f.image),
      }))
    );
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

/**
 * @desc Update an existing food item
 * @route PUT /api/foods/:id
 */
export async function updateFood(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedFood = await Food.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedFood) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
      message: "Food item updated successfully",
      food: {
        ...updatedFood.toObject(),
        image: getFullImageUrl(req, updatedFood.image),
      },
    });
  } catch (error) {
    console.error(" Error updating food item:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

/**
 * @desc Delete a food item
 * @route DELETE /api/foods/:id
 */
export async function deleteFood(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const deletedFood = await Food.findByIdAndDelete(id);

    if (!deletedFood) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error(" Error deleting food item:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

/**
 * @desc Search food items globally by name
 * @route GET /api/foods/search?query=
 */
export async function searchFood(req, res) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const foods = await Food.find({
      name: { $regex: query.trim(), $options: "i" },
    }).populate("restaurant", "name location cuisine");

    res.status(200).json(
      foods.map((f) => ({
        ...f.toObject(),
        image: getFullImageUrl(req, f.image),
      }))
    );
  } catch (error) {
    console.error("Error searching food items:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
