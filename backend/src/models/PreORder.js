import mongoose from "mongoose";

const PreOrderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  waitlist: { type: mongoose.Schema.Types.ObjectId, ref: "Waitlist" },
  customerName: { type: String, required: true },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalPrice: { type: Number, default: 0 },
  specialInstructions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PreOrder", PreOrderSchema);
