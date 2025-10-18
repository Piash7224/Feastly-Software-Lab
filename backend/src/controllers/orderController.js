// controllers/orderController.js
import Order from "../models/Order.js";
import Food from "../models/Food.js";

export const createOrder = async (req, res) => {
  try {
    const { customerName, items, restaurant, isPreOrder, preOrderDate } = req.body;

    // Calculate total
    let total = 0;
    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food) return res.status(404).json({ error: "Food not found" });
      total += food.price * item.quantity;
    }

    const order = new Order({
      customerName,
      items,
      totalPrice: total,
      restaurant,
      isPreOrder: !!isPreOrder,
      preOrderDate: isPreOrder && preOrderDate ? new Date(preOrderDate) : undefined
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.food").populate("restaurant");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
