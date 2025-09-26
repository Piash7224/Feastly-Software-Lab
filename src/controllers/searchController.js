import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";

//search restaurnts by name, location and with food ites
export async function search(req, res) {
    try {
        const { query } = req.query;
        if(!query) {
            return res.status(400).json({message: "Query parameter is required"});

        }
        //search resaturants by name and location
        const restaurantMatches = await Restaurant.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { cuisine: { $regex: query, $options: 'i' }  }
            ]
        });

        //search food items and connect it with restaurants
        const foodMatches = await Food.find({ name: { $regex: query, $options: 'i' } }).populate('restaurant');
        const restaurantsFromFood = foodMatches.map(food => food.restaurant);

        //combine to avoid duplicates
        const allMatches = [...restaurantMatches, ...restaurantsFromFood];
        const uniqueRestaurants = Array.from(new Map(allMatches.map(item => [item._id.toString(), item])).values());
        res.json(uniqueRestaurants);
    }catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({message: "Server Error"});
    }
}
