import express from "express";
import { createTable, getAllTables, updateTable,deleteTable, getAvailableTables, deleteAllTables } from "../controllers/tableController.js";

const router = express.Router();

router.post("/", createTable);
router.get("/", getAllTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);
router.delete("/", deleteAllTables);

//route for available tables
router.get("/availability", getAvailableTables);

export default router;

