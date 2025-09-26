import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

//add new food item
export async function addFoodItem(req, res)  {
    try {
        const { restaurantId, name, description, price, category} = req.body;
        const restaurant = await Restaurant.findById(restaurantId);
        if(!restaurant) {
            return res.status(404).json({message: "Restaurant not found"});
        }

        const food = new Food({
            name,
            description,
            price,
            category,
            restaurant: restaurantId
        });

        await food.save();
        res.status(201).json(food);
    }catch (error) {
        console.error("Error adding food item:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//get all food items
export async function getAllFoodByRestaurant(req, res) {
    try {
        const { restaurantId } = req.params;
        const foods = await Food.find({ restaurant: restaurantId });
        res.json(foods);
    }catch (error) {
        console.error("Error fetching food items:", error);
        res.status(500).json({message: error.message});

    }
}

//update food item
export async function updateFood(req, res) {
    try{
        const { id } = req.params;
        const updateFood = await Food.findByIdAndUpdate(id, req.body, { new: true });
        if(!updateFood) return res.status(404).json({message: "Food item not found"});
        res.json(updateFood);
    }catch (error){
        console.error("Error updating food item:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//delete food
export async function deleteFood(req, res) {
    try {
        const { id } = req.params;
        const deletedFood = await Food.findByIdAndDelete(id);
        if(!deletedFood) return res.status(404).json({message: "Food item not found"});
        res.json({message: "Food item deleted successfully"});
    }catch (error) {
        console.error("Error deleting food item:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//search food globally 

export async function searchFood(req, res) {
    try {
        const { query } = req.query;
        if(!query) return res.status(400).json({message: "Query parameter is required"});
        
        const foods = await Food.find({ name: { $regex: query, $options: 'i' } }).populate('restaurant', 'name location cuisine');
        res.json(foods);
    }catch (error) {
        console.error("Error searching food items:", error);
        res.status(500).json({message: "Server Error"});
    }
}