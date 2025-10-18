
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
	customerName: { type: String, required: true },
	items: [
		{
			food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
			quantity: { type: Number, required: true, min: 1 }
		}
	],
	totalPrice: { type: Number, required: true },
	status: { type: String, enum: ["pending", "preparing", "completed", "cancelled"], default: "pending" },
	restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
	isPreOrder: { type: Boolean, default: false },
	preOrderDate: { type: Date }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
