import express from "express";
import {
  createBooking,
  getAllBookings,
  deleteAllBookings,
  deleteBooking,
  getBookingsByRestaurantAndDate,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js"; // named import
import { customerOnly, ownerOnly, adminOnly, ownerOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes below require authentication
router.use(protect);

// ===== Customer routes =====

// Create a booking (only customers)
router.post("/", customerOnly, createBooking);

// Get bookings for a restaurant (customer-safe)
router.get("/customer/restaurant/:restaurantId", customerOnly, async (req, res, next) => {
  try {
    // Use existing controller but make it customer-friendly
    const { restaurantId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: "Date is required" });

    // Call existing controller logic
    const result = await getBookingsByRestaurantAndDate({
      params: { restaurantId },
      query: { date },
      user: req.user, // pass authenticated user
    });

    // Return only relevant info for customers
    res.status(200).json({
      tables: result.tables,
      message: "Customer-accessible table availability fetched",
    });
  } catch (err) {
    next(err);
  }
});

// ===== Owner/Admin routes =====

// Get all bookings (owner or admin)
router.get("/", ownerOrAdmin, getAllBookings);

// Get bookings by restaurant & date (owner or admin)
router.get("/restaurant/:restaurantId", ownerOrAdmin, getBookingsByRestaurantAndDate);

// Delete a booking by ID (owner or admin)
router.delete("/:id", ownerOrAdmin, deleteBooking);

// Delete all bookings (admin only)
router.delete("/", adminOnly, deleteAllBookings);

export default router;
