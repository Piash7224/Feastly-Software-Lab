import Restaurant from "../models/Restaurant.js";


export async function getRestaurants(req, res){
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    }catch (error) {
        console.error("Error fetching Restaurants:", error);
        res.status(500).json({message: "Server Error"});
    }

}
export async function getRestaurantById(req, res) {
    try {
    const restaurant = await Restaurant.findById(req.params.id);
    if(!restaurant) return res.status(404).json({message: "Restaurant not found"})
        res.json(restaurant);
    } catch (error) {
        console.error("Error fetching Restaurant:", error);
        res.status(500).json({message: "Server Error"});
    }
}

export async function createRestaurant(req, res) {
    try {
       const restaurant = await Restaurant.create(req.body);
       res.status (201).json(restaurant);

    } catch (error) {
        console.error("Error creating Restaurant:", error);
        res.status(500).json({message: "Server Error"});

    }

}

export async function updateRestaurant(req, res) {
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!restaurant) return res.status(404).json({message: "Restaurant not found"});
        res.json(restaurant);
       

    }
    catch (error) {
        console.error("Error updating Restaurant:", error);
        res.status(500).json({message: "Server Error"});
    }
}

export async function deleteRestaurant(req, res) {
   try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if(!restaurant) return res.status(404).json({message: "Restaurant not found"});
    res.json({message: "Restaurant deleted successfully"});

   } catch (error) {
    console.error("Error deleting Restaurant:", error);
    res.status(500).json({message: "Server Error"});
   }
}
export async function deleteAllRestaurants(req, res) {
    try {
        await Restaurant.deleteMany({});
        res.json({message: "All restaurants deleted successfully"});
    }catch (error) {
        console.error("Error deleting all Restaurants:", error);
        res.status(500).json({message: "Server Error"});
    }
}