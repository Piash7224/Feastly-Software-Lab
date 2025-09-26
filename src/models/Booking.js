import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema ({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId: {type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
