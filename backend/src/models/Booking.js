import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    partySize: {
        type: Number,
        required: true
    },
    duration: {
        type: Number // in minutes
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending"
    },
    preOrders: [
        {
            food: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Food",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for faster queries
bookingSchema.index({ restaurant: 1, date: 1 });
bookingSchema.index({ tableId: 1, date: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
