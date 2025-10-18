import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    restaurant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Restaurant", 
        required: true 
    },
    number: { 
        type: Number, 
        required: true 
    }, // table number
    capacity: { 
        type: Number, 
        required: true 
    }, // seats at this table

    // Table layout position (for frontend table map)
    position: {
        x: { type: Number, default: 0 }, 
        y: { type: Number, default: 0 }
    },

    shape: {
        type: String,
        enum: ["circle", "rectangle", "square"],
        default: "circle"
    },

    size: {
        width: { type: Number, default: 50 }, 
        height: { type: Number, default: 50 }
    },

    // ✅ Optional: default booking duration per table (minutes)
    defaultDuration: { 
        type: Number, 
        default: 90 
    },

    // ✅ Optional: track table status (useful for live updates)
    status: {
        type: String,
        enum: ["available", "booked", "maintenance"],
        default: "available"
    }

}, {
    timestamps: true
});

const Table = mongoose.model("Table", tableSchema);
export default Table;
