import express from "express";
import {
  createBooking,
  getAllBookings,
  deleteAllBookings,
  deleteBooking,
  getBookingsByRestaurantAndDate,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { customerOnly, ownerOnly, adminOnly, ownerOrAdmin } from "../middleware/roleMiddleware.js";

import Table from "../models/Table.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// All routes below require authentication
router.use(protect);

// ===== Customer routes =====

// Create a booking (only customers)
router.post("/", customerOnly, createBooking);

// Get user's own bookings
router.get("/my-bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("restaurant", "name")
      .sort({ date: -1 });
    
    res.status(200).json(bookings.map(b => ({
      ...b.toObject(),
      restaurantName: b.restaurant?.name || "Unknown"
    })));
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Get bookings for a restaurant (customer or owner/admin)
router.get("/restaurant/:restaurantId", async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: "Date is required" });

    // Fetch start/end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const allTables = await Table.find({ restaurant: restaurantId });
    const bookings = await Booking.find({
      restaurant: restaurantId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("tableId");

    // Map bookings to tables
    const tableBookingsMap = {};
    allTables.forEach((table) => {
      tableBookingsMap[table._id.toString()] = {
        tableId: table._id.toString(),
        tableNumber: table.number || table.tableNumber,
        capacity: table.capacity,
        bookings: [],
      };
    });

    bookings.forEach((booking) => {
      if (booking.tableId?._id) {
        const tableId = booking.tableId._id.toString();
        if (tableBookingsMap[tableId]) {
          const bookingData =
            req.user.role === "customer"
              ? {
                  startTime: booking.startTime,
                  endTime: booking.endTime,
                  preOrders: booking.preOrders || [],
                }
              : booking; // owner/admin see full booking
          tableBookingsMap[tableId].bookings.push(bookingData);
        }
      }
    });

    return res.status(200).json({
      tables: Object.values(tableBookingsMap),
      message:
        req.user.role === "customer"
          ? "Customer-accessible table availability fetched"
          : "Full table bookings fetched",
    });
  } catch (err) {
    next(err);
  }
});

// ===== Owner/Admin routes =====

// Get all bookings (owner or admin)
router.get("/", ownerOrAdmin, getAllBookings);

// Delete a booking by ID (owner or admin)
router.delete("/:id", ownerOrAdmin, deleteBooking);

// Delete all bookings (admin only)
router.delete("/", adminOnly, deleteAllBookings);

export default router;
