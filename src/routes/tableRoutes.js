import express from "express";
import { createTable, getAllTables, updateTable,deleteTable, getAvailableTables } from "../controllers/tableController.js";

const router = express.Router();

router.post("/", createTable);
router.get("/", getAllTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

//route for available tables
router.get("/availability", getAvailableTables);

export default router;

