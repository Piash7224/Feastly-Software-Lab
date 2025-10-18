import express from "express";
import multer from "multer";
import path from "path";
import {
  addFoodItem,
  getAllFoodByRestaurant,
  updateFood,
  deleteFood,
  searchFood,
} from "../controllers/foodController.js";

const router = express.Router();

// ============================
// Multer Storage Configuration
// ============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure "uploads" folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// ============================
// File Filter (Image Only)
// ============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
  }
};

// ============================
// Multer Middleware
// ============================
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB per image
});

// ============================
// Routes
// ============================

/**
 * @route   POST /api/foods
 * @desc    Add a new food item (linked to a restaurant)
 * @access  Public or Protected (depending on your auth)
 */
router.post("/", upload.single("image"), addFoodItem);

/**
 * @route   GET /api/foods/restaurant/:restaurantId
 * @desc    Get all food items for a specific restaurant
 */
router.get("/restaurant/:restaurantId", getAllFoodByRestaurant);

/**
 * @route   PUT /api/foods/:id
 * @desc    Update an existing food item (with optional new image)
 */
router.put("/:id", upload.single("image"), updateFood);

/**
 * @route   DELETE /api/foods/:id
 * @desc    Delete a food item by ID
 */
router.delete("/:id", deleteFood);

/**
 * @route   GET /api/foods/search?query=
 * @desc    Search food items globally by name
 */
router.get("/search", searchFood);

// ============================
// Export
// ============================
export default router;
