import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    number: { type: Number, required: true },
    capacity: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },

});
const Table = mongoose.model("Table", tableSchema);
export default Table;