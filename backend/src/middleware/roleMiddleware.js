// middleware/roleMiddleware.js

// Middleware to allow only owners
export const ownerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Access denied: Owners only" });
  }
  next();
};

// Middleware to allow only admins
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

// Middleware to allow either owner or admin
export const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (!["owner", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied: Owner or Admin only" });
  }
  next();
};

// ----------------------------
// Middleware to allow only customers
export const customerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (req.user.role !== "customer") {
    return res.status(403).json({ message: "Access denied: Customers only" });
  }
  next();
};
