import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // URL or path
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Food", FoodSchema);
