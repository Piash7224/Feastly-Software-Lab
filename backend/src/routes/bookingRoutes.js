import express from "express";
import { createBooking, getAllBookings, deleteAllBookings, deleteBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getAllBookings);
router.delete("/:id", deleteBooking);
router.delete("/", deleteAllBookings);
export default router;