import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, default: "Unknown" },
    cuisine: { type: String, default: "Unknown" },
    rating: { type: Number, default: 0 },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    
    // Instead of fixed slots → working hours
    openingHour: { type: String, required: true },   // e.g., "10:00"
    closingHour: { type: String, required: true },   // e.g., "22:00"

    image: { type: String, default: "/uploads/default.png" }, // default image
}, {
    timestamps: true
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
