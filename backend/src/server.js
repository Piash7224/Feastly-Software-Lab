import express from "express";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ======= Cron & Waitlist =======
import cron from "node-cron";
import { autoSeatWaitlist, processWaitlistForTable } from "./controllers/waitlistController.js";
import Restaurant from "./models/Restaurant.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

// ======= File path helpers =======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======= Ensure uploads folder exists =======
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads folder");
}

// ======= Middleware =======
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(rateLimiter);


// ======= Serve uploaded images statically =======
app.use("/uploads", express.static(uploadsDir));

// ======= API Routes =======
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings", bookingRoutes); // bookingRoutes now includes customerOnly middleware
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes); // auth routes for login/register

// ======= Global error handler =======
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).json({ message: "Something broke!" });
});

// ======= Start server after DB connection =======
connectDB()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on PORT: ${PORT}`);
    });

    // ======= Cron Job: Auto-seat waitlist =======
    // Runs every minute
    cron.schedule("* * * * *", async () => {
      try {
        const restaurants = await Restaurant.find().lean();
        for (const rest of restaurants) {
          // Auto-seat entries whose requestedStartTime has passed
          const seatedCount = await autoSeatWaitlist(rest._id);
          if (seatedCount > 0) {
            console.log(`🕒 Auto-seated ${seatedCount} waitlist entries for restaurant ${rest.name}`);
          }

          // Auto-assign tables for waiting entries
          await processWaitlistForTable(rest._id);
        }
      } catch (err) {
        console.error("❌ Cron Job Error:", err);
      }
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
  });
