import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =============================
// 🔐 Auth Middleware: Protect Route
// =============================
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user and exclude password
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: "User is blocked" });
      }

      req.user = user; // attach user to request
      return next();
    } catch (err) {
      console.error("🔒 JWT Error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    // No token provided
    return res.status(401).json({ message: "No token provided" });
  }
};

// =============================
// 👤 Customer-Only Middleware
// =============================
export const customerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Access denied: Customers only" });
  }
  next();
};

// =============================
// 🧑‍💼 Owner-Only Middleware
// =============================
export const ownerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({ message: "Access denied: Owners only" });
  }
  next();
};

// =============================
// 👑 Admin-Only Middleware
// =============================
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

// =============================
// 👥 Owner or Admin Middleware
// =============================
export const ownerOrAdmin = (req, res, next) => {
  if (!req.user || !["owner", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied: Owner or Admin only" });
  }
  next();
};
