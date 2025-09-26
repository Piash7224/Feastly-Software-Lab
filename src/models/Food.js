import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String},
    price: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }

}, { timestamps: true });

const Food = mongoose.model("Food", foodSchema);
export default Food;