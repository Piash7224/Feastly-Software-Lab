import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile
} from "../controllers/authController.js";

import { protect, adminOnly, ownerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================
// 🔐 AUTH ROUTES
// =============================

// 📝 Register new user (customer/owner)
router.post("/register", register);

// 🔑 Login for all roles (customer / owner / admin)
router.post("/login", login);

// 👤 Get current user profile (must be logged in)
router.get("/profile", protect, getProfile);

// ✏️ Update current user profile
router.put("/profile", protect, updateProfile);

// (Optional) Admin or Owner-specific routes (ready for future use)
// Example: router.get("/admin-only", protect, adminOnly, someAdminFunction);

export default router;
