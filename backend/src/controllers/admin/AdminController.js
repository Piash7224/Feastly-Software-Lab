import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import Waitlist from "../models/Waitlist.js";
import Table from "../models/Table.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";

// ----- Dashboard Stats -----
export async function getAdminDashboard(req, res) {
  try {
    const restaurantId = req.params.restaurantId;

    const bookingsToday = await Booking.find({
      restaurant: restaurantId,
      date: { $gte: new Date().setHours(0,0,0), $lt: new Date().setHours(23,59,59) },
    });

    const waitlistToday = await Waitlist.find({
      restaurant: restaurantId,
      date: { $gte: new Date().setHours(0,0,0), $lt: new Date().setHours(23,59,59) },
    });

    const tables = await Table.find({ restaurant: restaurantId });

    res.status(200).json({
      bookingsToday,
      waitlistToday,
      tables,
      stats: {
        totalBookings: bookingsToday.length,
        totalWaitlist: waitlistToday.length,
        seated: waitlistToday.filter(w => w.status === "seated").length,
        booked: waitlistToday.filter(w => w.status === "booked").length,
        waiting: waitlistToday.filter(w => w.status === "waiting").length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard" });
  }
}

// ----- Bookings -----
export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find({ restaurant: req.params.restaurantId }).sort({ startTime: 1 }).lean();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking" });
  }
}

// ----- Waitlist -----
export async function getWaitlistAdmin(req, res) {
  try {
    const waitlist = await Waitlist.find({ restaurant: req.params.restaurantId }).sort({ queuePosition: 1 }).lean();
    res.status(200).json(waitlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching waitlist" });
  }
}

export async function updateWaitlistStatusAdmin(req, res) {
  try {
    const entry = await Waitlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Error updating waitlist status" });
  }
}

// ----- Tables -----
export async function getTablesAdmin(req, res) {
  try {
    const tables = await Table.find({ restaurant: req.params.restaurantId });
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tables" });
  }
}

export async function updateTable(req, res) {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: "Error updating table" });
  }
}

// ----- Restaurants (Approval Flow) -----
export async function getRestaurantsAdmin(req, res) {
  try {
    const { status, limit } = req.query; // optional: pending|approved|rejected
    const query = status ? { status } : {};
    const q = Restaurant.find(query).sort({ createdAt: -1 });
    if (limit) q.limit(parseInt(limit));
    const restaurants = await q.populate("owner", "name email").lean();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
}

export async function updateRestaurantAdmin(req, res) {
  try {
    const { action } = req.body; // approve|reject|delete
    const { id } = req.params;

    if (action === "approve") {
      const updated = await Restaurant.findByIdAndUpdate(id, { status: "approved" }, { new: true });
      return res.status(200).json(updated);
    }
    if (action === "reject") {
      const updated = await Restaurant.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
      return res.status(200).json(updated);
    }
    if (action === "delete") {
      await Table.deleteMany({ restaurant: id });
      await Food.deleteMany({ restaurant: id });
      await Booking.deleteMany({ restaurant: id });
      await Waitlist.deleteMany({ restaurant: id });
      await Restaurant.findByIdAndDelete(id);
      return res.status(200).json({ message: "Restaurant and related data deleted" });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant" });
  }
}

// ----- Users (Block/Allow) -----
export async function getUsersAdmin(req, res) {
  try {
    const users = await User.find().select("name email role isBlocked createdAt").lean();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
}

export async function updateUserStatusAdmin(req, res) {
  try {
    const { isBlocked } = req.body;
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { isBlocked: !!isBlocked }, { new: true }).select("name email role isBlocked");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating user status" });
  }
}

// ----- Revenue (Preorders) -----
export async function getPreorderRevenueByDate(req, res) {
  try {
    const { restaurantId } = req.params;
    const { from, to } = req.query; // optional ISO dates
    const restObjectId = mongoose.Types.ObjectId.isValid(restaurantId) ? new mongoose.Types.ObjectId(restaurantId) : restaurantId;
    const matchOrders = {
      restaurant: restObjectId,
      isPreOrder: true,
    };

    if (from || to) {
      matchOrders.preOrderDate = {};
      if (from) matchOrders.preOrderDate.$gte = new Date(from);
      if (to) matchOrders.preOrderDate.$lte = new Date(to);
    }

    // Revenue from Order (preorders)
    const ordersData = await Order.aggregate([
      { $match: matchOrders },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$preOrderDate" } },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue from Booking.preOrders (if user used booking pre-order flow)
    const matchBookings = { restaurant: restObjectId };
    if (from || to) {
      matchBookings.date = {};
      if (from) matchBookings.date.$gte = new Date(from);
      if (to) matchBookings.date.$lte = new Date(to);
    }
    const bookingsData = await Booking.aggregate([
      { $match: matchBookings },
      { $unwind: { path: "$preOrders", preserveNullAndEmptyArrays: false } },
      { $lookup: { from: "foods", localField: "preOrders.food", foreignField: "__idDoesNotExist__", as: "_noop" } }
    ]);
    // Above lookup is a placeholder to satisfy aggregation builder in some drivers; real lookup below

    const bookingsRevenue = await Booking.aggregate([
      { $match: matchBookings },
      { $unwind: "$preOrders" },
      { $lookup: { from: "foods", localField: "preOrders.food", foreignField: "_id", as: "food" } },
      { $unwind: "$food" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          revenue: { $sum: { $multiply: ["$preOrders.quantity", "$food.price"] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge by date key
    const map = new Map();
    for (const d of ordersData) map.set(d._id, { date: d._id, revenue: d.revenue, count: d.count });
    for (const d of bookingsRevenue) {
      if (map.has(d._id)) {
        const prev = map.get(d._id);
        map.set(d._id, { date: d._id, revenue: prev.revenue + d.revenue, count: prev.count + d.count });
      } else {
        map.set(d._id, { date: d._id, revenue: d.revenue, count: d.count });
      }
    }
    const merged = Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));

    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: "Error fetching revenue" });
  }
}

// ----- Global Revenue (All Restaurants) -----
export async function getGlobalRevenueDaily(req, res) {
  try {
    const { from, to } = req.query;
    const matchOrders = {};
    if (from || to) {
      matchOrders.createdAt = {};
      if (from) matchOrders.createdAt.$gte = new Date(from);
      if (to) matchOrders.createdAt.$lte = new Date(to);
    }

    const ordersAgg = await Order.aggregate([
      { $match: matchOrders },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const matchBookings = {};
    if (from || to) {
      matchBookings.date = {};
      if (from) matchBookings.date.$gte = new Date(from);
      if (to) matchBookings.date.$lte = new Date(to);
    }
    const bookingsAgg = await Booking.aggregate([
      { $match: matchBookings },
      { $unwind: "$preOrders" },
      { $lookup: { from: "foods", localField: "preOrders.food", foreignField: "_id", as: "food" } },
      { $unwind: "$food" },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, revenue: { $sum: { $multiply: ["$preOrders.quantity", "$food.price"] } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const map = new Map();
    for (const d of ordersAgg) map.set(d._id, { date: d._id, revenue: d.revenue, count: d.count });
    for (const d of bookingsAgg) {
      if (map.has(d._id)) {
        const prev = map.get(d._id);
        map.set(d._id, { date: d._id, revenue: prev.revenue + d.revenue, count: prev.count + d.count });
      } else {
        map.set(d._id, { date: d._id, revenue: d.revenue, count: d.count });
      }
    }
    const merged = Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily revenue" });
  }
}

export async function getGlobalRevenueMonthly(req, res) {
  try {
    const { from, to } = req.query;
    const matchOrders = {};
    if (from || to) {
      matchOrders.createdAt = {};
      if (from) matchOrders.createdAt.$gte = new Date(from);
      if (to) matchOrders.createdAt.$lte = new Date(to);
    }
    const ordersAgg = await Order.aggregate([
      { $match: matchOrders },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const matchBookings = {};
    if (from || to) {
      matchBookings.date = {};
      if (from) matchBookings.date.$gte = new Date(from);
      if (to) matchBookings.date.$lte = new Date(to);
    }
    const bookingsAgg = await Booking.aggregate([
      { $match: matchBookings },
      { $unwind: "$preOrders" },
      { $lookup: { from: "foods", localField: "preOrders.food", foreignField: "_id", as: "food" } },
      { $unwind: "$food" },
      { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, revenue: { $sum: { $multiply: ["$preOrders.quantity", "$food.price"] } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const map = new Map();
    for (const d of ordersAgg) {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      map.set(key, { period: key, revenue: d.revenue, count: d.count });
    }
    for (const d of bookingsAgg) {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (map.has(key)) {
        const prev = map.get(key);
        map.set(key, { period: key, revenue: prev.revenue + d.revenue, count: prev.count + d.count });
      } else {
        map.set(key, { period: key, revenue: d.revenue, count: d.count });
      }
    }
    const merged = Array.from(map.values()).sort((a,b) => a.period.localeCompare(b.period));
    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly revenue" });
  }
}
