import express from "express";
import {
    addToWaitlist,
    deleteAllWaitlist,
    getWaitlist,
    updateWaitlistStatus,
    removeFromWaitlist,
    checkWaitlistAvailability
} from "../controllers/waitlistController.js";
import { protect } from "../middleware/authMiddleware.js";
import Waitlist from "../models/Waitlist.js";

const router = express.Router();

// Add to waitlist
router.post("/", protect, addToWaitlist);

// Check waitlist availability (without adding entry)
router.post("/availability", checkWaitlistAvailability);

// Get user's own waitlist entries
router.get("/my-entries", protect, async (req, res) => {
  try {
    const waitlist = await Waitlist.find({ userId: req.user.id })
      .populate("restaurant", "name")
      .sort({ date: -1 });
    
    res.status(200).json(waitlist.map(w => ({
      ...w.toObject(),
      restaurantName: w.restaurant?.name || "Unknown"
    })));
  } catch (error) {
    console.error("Error fetching user waitlist:", error);
    res.status(500).json({ message: "Error fetching waitlist entries" });
  }
});

// Get waitlist entries
router.get("/", getWaitlist);

// Update waitlist status
router.put("/:id/status", updateWaitlistStatus);

// Remove a waitlist entry
router.delete("/:id", removeFromWaitlist);

// Delete all waitlist entries
router.delete("/", deleteAllWaitlist);

export default router;
