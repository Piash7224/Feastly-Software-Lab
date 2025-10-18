import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";
import Food from "../models/Food.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================
// Role check helpers
// ============================
function checkOwner(req, res) {
  if (!req.user || req.user.role !== "owner") {
    res.status(403).json({ message: "Access denied: Owners only" });
    return false;
  }
  return true;
}

function checkAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Access denied: Admins only" });
    return false;
  }
  return true;
}

// ============================
// Image URL generator
// ============================
function getFullImageUrl(req, imagePath) {
  if (!imagePath) {
    return `${req.protocol}://${req.get("host")}/uploads/default.png`;
  }
  if (!imagePath.startsWith("/")) imagePath = "/" + imagePath;
  return `${req.protocol}://${req.get("host")}${imagePath}`;
}

// ============================
// Get All Restaurants
// ============================
export async function getRestaurants(req, res) {
  try {
    const { query, page = 1, limit = 12 } = req.query;
    const baseFilter = query ? { name: { $regex: query, $options: "i" } } : {};
    // Public: only approved; Admin: can query all
    const role = req.user?.role;
    const filter = role === "admin" ? baseFilter : { ...baseFilter, status: "approved" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const restaurantsWithDetails = await Promise.all(
      restaurants.map(async (r) => {
        const tables = await Table.find({ restaurant: r._id });
        const foods = await Food.find({ restaurant: r._id });
        return {
          ...r.toObject(),
          image: getFullImageUrl(req, r.image),
          tables,
          foods: foods.map((f) => ({
            ...f.toObject(),
            image: getFullImageUrl(req, f.image),
          })),
        };
      })
    );

    res.json({
      restaurants: restaurantsWithDetails,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching Restaurants:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// ============================
// Get Restaurant by ID
// ============================
export async function getRestaurantById(req, res) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    // Block access to non-approved unless admin or owner of the restaurant
    const isAdmin = req.user && req.user.role === "admin";
    const isOwner = req.user && restaurant.owner && restaurant.owner.toString() === req.user._id.toString();
    if (restaurant.status !== "approved" && !isAdmin && !isOwner) {
      return res.status(403).json({ message: "Restaurant is not approved yet" });
    }

    const tables = await Table.find({ restaurant: restaurant._id });
    const foods = await Food.find({ restaurant: restaurant._id });

    res.json({
      ...restaurant.toObject(),
      image: getFullImageUrl(req, restaurant.image),
      tables,
      foods: foods.map((f) => ({
        ...f.toObject(),
        image: getFullImageUrl(req, f.image),
      })),
    });
  } catch (error) {
    console.error("Error fetching Restaurant:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// ============================
// Create Restaurant + Tables + Foods
// ============================
export async function createRestaurant(req, res) {
  if (!checkOwner(req, res)) return;

  try {
    let { name, location, cuisine, openingHour, closingHour, tables, foods } = req.body;

    if (!name || !location || !openingHour || !closingHour) {
      return res.status(400).json({
        message: "Name, location, openingHour, and closingHour are required",
      });
    }

    try {
      tables = typeof tables === "string" ? JSON.parse(tables) : tables || [];
      foods = typeof foods === "string" ? JSON.parse(foods) : foods || [];
    } catch {
      tables = [];
      foods = [];
    }

    const image = req.files?.restaurantImage
      ? `/uploads/${req.files.restaurantImage[0].filename}`
      : "/uploads/default.png";

    const restaurant = await Restaurant.create({
      name,
      location,
      cuisine,
      openingHour,
      closingHour,
      image,
      owner: req.user._id, // link owner
    });

    let createdTables = [];
    if (Array.isArray(tables)) {
      const allowedShapes = ["circle", "rectangle", "square"];
      for (const table of tables) {
        const { tableNumber, capacity, position = { x: 0, y: 0 }, shape = "rectangle", size = { width: 50, height: 50 } } = table;
        if (!tableNumber) continue;

        const newTable = await Table.create({
          restaurant: restaurant._id,
          number: tableNumber,
          capacity,
          position,
          shape: allowedShapes.includes(shape) ? shape : "rectangle",
          size,
        });
        createdTables.push(newTable);
      }
    }

    let createdFoods = [];
    if (Array.isArray(foods) && foods.length > 0) {
      createdFoods = await Promise.all(
        foods.map(async (item, index) => {
          let imagePath = "/uploads/default.png";
          if (req.files?.foodImages && req.files.foodImages[index]) {
            imagePath = `/uploads/${req.files.foodImages[index].filename}`;
          } else if (item.image) {
            imagePath = item.image;
          }

          const newFood = await Food.create({
            restaurant: restaurant._id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: imagePath,
          });
          return newFood;
        })
      );
    }

    res.status(201).json({
      restaurant: {
        ...restaurant.toObject(),
        image: getFullImageUrl(req, restaurant.image),
      },
      tables: createdTables,
      foods: createdFoods.map((f) => ({ ...f.toObject(), image: getFullImageUrl(req, f.image) })),
      message: "Restaurant, tables, and menu created successfully",
    });
  } catch (error) {
    console.error("Error creating Restaurant:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// ============================
// Update Restaurant + Tables + Foods
// ============================
export async function updateRestaurant(req, res) {
  if (!checkOwner(req, res)) return;

  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own restaurants" });
    }

    const updateData = { ...req.body };
    try {
      updateData.tables = typeof updateData.tables === "string" ? JSON.parse(updateData.tables) : updateData.tables || [];
      updateData.foods = typeof updateData.foods === "string" ? JSON.parse(updateData.foods) : updateData.foods || [];
    } catch {
      updateData.tables = [];
      updateData.foods = [];
    }

    if (req.files?.restaurantImage) {
      updateData.image = `/uploads/${req.files.restaurantImage[0].filename}`;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Replace tables
    await Table.deleteMany({ restaurant: updatedRestaurant._id });
    const allowedShapes = ["circle", "rectangle", "square"];
    const updatedTables = await Promise.all(
      (updateData.tables || []).map(async (table) =>
        Table.create({
          restaurant: updatedRestaurant._id,
          number: table.tableNumber,
          capacity: table.capacity,
          position: table.position || { x: 0, y: 0 },
          shape: allowedShapes.includes(table.shape) ? table.shape : "rectangle",
          size: table.size || { width: 50, height: 50 },
        })
      )
    );

    // Replace foods
    await Food.deleteMany({ restaurant: updatedRestaurant._id });
    const updatedFoods = await Promise.all(
      (updateData.foods || []).map(async (item, index) => {
        let imagePath = "/uploads/default.png";
        if (req.files?.foodImages && req.files.foodImages[index]) {
          imagePath = `/uploads/${req.files.foodImages[index].filename}`;
        } else if (item.image) {
          imagePath = item.image;
        }

        return await Food.create({
          restaurant: updatedRestaurant._id,
          name: item.name,
          price: item.price,
          description: item.description,
          image: imagePath,
        });
      })
    );

    res.json({
      restaurant: { ...updatedRestaurant.toObject(), image: getFullImageUrl(req, updatedRestaurant.image) },
      tables: updatedTables,
      foods: updatedFoods.map((f) => ({ ...f.toObject(), image: getFullImageUrl(req, f.image) })),
      message: "Restaurant, tables, and menu updated successfully",
    });
  } catch (error) {
    console.error("Error updating Restaurant:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// ============================
// Delete Single Restaurant
// ============================
export async function deleteRestaurant(req, res) {
  if (!checkOwner(req, res)) return;

  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own restaurants" });
    }

    await Table.deleteMany({ restaurant: restaurant._id });
    await Food.deleteMany({ restaurant: restaurant._id });
    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: "Restaurant, tables, and menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting Restaurant:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// ============================
// Delete All Restaurants (Admin only)
// ============================
export async function deleteAllRestaurants(req, res) {
  if (!checkAdmin(req, res)) return;

  try {
    const restaurants = await Restaurant.find();
    const restaurantIds = restaurants.map((r) => r._id);

    await Table.deleteMany({ restaurant: { $in: restaurantIds } });
    await Food.deleteMany({ restaurant: { $in: restaurantIds } });
    await Restaurant.deleteMany({});

    res.json({ message: "All restaurants, tables, and menus deleted successfully" });
  } catch (error) {
    console.error("Error deleting all Restaurants:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
