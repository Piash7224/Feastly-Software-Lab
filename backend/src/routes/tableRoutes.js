import express from "express";
import { createTable, getAllTables, updateTable, deleteTable, getAvailableTables, deleteAllTables, getTablesByRestaurant } from "../controllers/tableController.js";

const router = express.Router();

router.post("/", createTable);
router.get("/", getAllTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);
router.delete("/", deleteAllTables);

// Route for available tables
router.get("/availability", getAvailableTables);

// Route to get tables by restaurant ID
router.get("/restaurant/:restaurantId", getTablesByRestaurant);


export default router;

