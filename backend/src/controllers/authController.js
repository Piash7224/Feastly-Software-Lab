import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ===== Generate JWT =====
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ===== Register Controller =====
export const register = async (req, res) => {
  let { name, email, password, role, phone } = req.body;

  try {
    // ===== Basic Validation =====
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // ===== Clean Input =====
    name = name.trim();
    email = email.trim().toLowerCase();
    if (phone) phone = phone.trim();

    // ===== Role Validation (Now includes 'admin') =====
    if (role && !["customer", "owner", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'customer', 'owner', or 'admin'" });
    }
    role = role || "customer"; // Default role

    // ===== Check for Existing User =====
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ===== Create User =====
    const user = await User.create({ name, email, password, role, phone });
    const token = generateToken(user._id);

    // ===== Response =====
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
      },
    });
  } catch (err) {
    console.error("🔥 Register Error:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ===== Login Controller =====
export const login = async (req, res) => {
  let { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    // ===== Authenticated =====
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
      },
    });
  } catch (err) {
    console.error("🔥 Login Error:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ===== Get Profile =====
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(req.user);
  } catch (err) {
    console.error("🔥 GetProfile Error:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ===== Update Profile =====
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let { name, email, phone, password } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (phone) user.phone = phone.trim();
    if (password) user.password = password; // Schema auto-hashes

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
      },
    });
  } catch (err) {
    console.error("🔥 UpdateProfile Error:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
