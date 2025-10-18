import express from "express";
import {
    addToWaitlist,
    deleteAllWaitlist,
    getWaitlist,
    updateWaitlistStatus,
    removeFromWaitlist,
    checkWaitlistAvailability
} from "../controllers/waitlistController.js";

const router = express.Router();

// Add to waitlist
router.post("/", addToWaitlist);

// Check waitlist availability (without adding entry)
router.post("/availability", checkWaitlistAvailability);

// Get waitlist entries
router.get("/", getWaitlist);

// Update waitlist status
router.put("/:id/status", updateWaitlistStatus);

// Remove a waitlist entry
router.delete("/:id", removeFromWaitlist);

// Delete all waitlist entries
router.delete("/", deleteAllWaitlist);

export default router;
