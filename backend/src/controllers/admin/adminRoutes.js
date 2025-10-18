import express from "express";
import {
  getAdminDashboard,
  getAllBookings,
  updateBookingStatus,
  getWaitlistAdmin,
  updateWaitlistStatusAdmin,
  getTablesAdmin,
  updateTable,
  getRestaurantsAdmin,
  updateRestaurantAdmin,
  getUsersAdmin,
  updateUserStatusAdmin,
  getPreorderRevenueByDate,
  getGlobalRevenueDaily,
  getGlobalRevenueMonthly,
} from "../controllers/AdminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================
// 👑 Admin Protected Routes
// =============================

// 📊 Dashboard stats for a restaurant
router.get("/dashboard/:restaurantId", protect, adminOnly, getAdminDashboard);

// 📅 Manage all bookings
router.get("/bookings/:restaurantId", protect, adminOnly, getAllBookings);
router.put("/bookings/:id/status", protect, adminOnly, updateBookingStatus);

// 🕒 Manage waitlist
router.get("/waitlist/:restaurantId", protect, adminOnly, getWaitlistAdmin);
router.put("/waitlist/:id/status", protect, adminOnly, updateWaitlistStatusAdmin);

// 🍽️ Manage tables
router.get("/tables/:restaurantId", protect, adminOnly, getTablesAdmin);
router.put("/tables/:id", protect, adminOnly, updateTable);

// 🏪 Restaurant approvals
router.get("/restaurants", protect, adminOnly, getRestaurantsAdmin);
router.patch("/restaurants/:id", protect, adminOnly, updateRestaurantAdmin);

// 👥 Users
router.get("/users", protect, adminOnly, getUsersAdmin);
router.patch("/users/:id/status", protect, adminOnly, updateUserStatusAdmin);

// 💹 Revenue (preorders)
router.get("/revenue/:restaurantId/preorders", protect, adminOnly, getPreorderRevenueByDate);
router.get("/revenue/global/daily", protect, adminOnly, getGlobalRevenueDaily);
router.get("/revenue/global/monthly", protect, adminOnly, getGlobalRevenueMonthly);

export default router;
