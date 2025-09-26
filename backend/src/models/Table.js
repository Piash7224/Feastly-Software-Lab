import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    number: { type: Number, required: true },
    capacity: { type: Number, required: true },

    //table layout position
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
     },
     shape: { type: String, enum: ['circle', 'rectangle','square'], default: 'circle'},
     size: {
        width: { type: Number, default: 1},
        height: { type: Number, default: 1}
     } 
});
const Table = mongoose.model("Table", tableSchema);
export default Table;