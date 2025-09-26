import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    partySize: { type: Number, required: true },
    status: { type: String, enum: ['waiting', 'seated', 'cancelled'], default: 'waiting' }, 
    createdAt: { type: Date, default: Date.now }
});
const Waitlist = mongoose.model("Waitlist", waitlistSchema);
export default Waitlist;