import mongoose from "mongoose";

//creat a schema
//model based off of that schema
const restaurantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String},
        cuisine: { type: String },
        rating: { type: Number, default:  0 },
    });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;



         
   
    

  

