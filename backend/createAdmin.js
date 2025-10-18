// createAdmin.js ✅ FIXED VERSION
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  const adminExists = await User.findOne({ email: "admin4@gmail.com" });
  if (adminExists) {
    console.log("⚠️ Admin already exists.");
    process.exit();
  }

  const admin = new User({
    name: "Admin",
    email: "admin4@gmail.com",
    password: "admin123", // ✅ plain text — model will hash automatically
    role: "admin",
  });

  await admin.save();
  console.log("✅ Admin created successfully");
  process.exit();
};

createAdmin();
