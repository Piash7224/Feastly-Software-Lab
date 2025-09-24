 import express from "express"
 import { getRestaurants, getRestaurantById,createRestaurant, updateRestaurant, deleteRestaurant, deleteAllRestaurants} from "../controllers/restaurantController.js";

 const router = express.Router();

 router.get("/", getRestaurants);
 router.get("/:id", getRestaurantById);
 router.post("/", createRestaurant);
 router.put("/:id", updateRestaurant);
 router.delete("/:id", deleteRestaurant);
 router.delete("/", deleteAllRestaurants);

 export default router;

 


