import mongoose from "mongoose";
import Table from "./src/models/Table.js";
import Booking from "./src/models/Booking.js";
import dotenv from "dotenv";

dotenv.config();




const restaurantId = "68d2e4e14707397c8545a941"; // replace with your restaurant ID
const date = "2025-09-24"; 
const timeSlot = "12:00-13:00";

async function debugAvailability() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // All tables for this restaurant
    const allTables = await Table.find({ restaurant: restaurantId });
    console.log("All Tables:", allTables);

    // Booked tables for this restaurant on given date/timeSlot
    const queryDate = new Date(date);
    const nextDate = new Date(queryDate);
    nextDate.setDate(queryDate.getDate() + 1);

    const bookedTables = await Booking.find({
      restaurant: restaurantId,
      date: { $gte: queryDate, $lt: nextDate },
      timeSlot: timeSlot
    }).select("tableId");

    console.log("Booked Tables:", bookedTables);

    // Available tables
    const bookedIds = bookedTables.map(b => b.tableId.toString());
    const availableTables = allTables.filter(t => !bookedIds.includes(t._id.toString()));
    console.log("Available Tables:", availableTables);

    await mongoose.disconnect();
    console.log("MongoDB disconnected");

  } catch (err) {
    console.error(err);
  }
}

debugAvailability();
