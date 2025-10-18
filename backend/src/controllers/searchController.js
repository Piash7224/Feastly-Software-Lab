import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";

// Search restaurants by name, location, cuisine, and food items
export async function search(req, res) {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Query parameter is required" });
        }

        const regex = new RegExp(query, "i"); // case-insensitive partial match

        // Search restaurants by name, location, or cuisine
        const restaurantMatches = await Restaurant.find({
            $or: [
                { name: regex },
                { location: regex },
                { cuisine: regex }
            ]
        }).limit(10); // Limit to top 10 results for performance

        // Search food items and connect them to restaurants
        const foodMatches = await Food.find({ name: regex })
            .populate("restaurant")
            .limit(10);

        const restaurantsFromFood = foodMatches
            .map(food => food.restaurant)
            .filter(Boolean);

        // Combine results without duplicates
        const allMatches = [...restaurantMatches, ...restaurantsFromFood];
        const uniqueRestaurants = Array.from(
            new Map(allMatches.map(item => [item._id.toString(), item]))
        ).map(([_, value]) => value);

        res.json(uniqueRestaurants);
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
