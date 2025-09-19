import express from "express";
import { createTable, getAllTables, updateTable,deleteTable } from "../controllers/tableController.js";

const router = express.Router();

router.post("/", createTable);
router.get("/", getAllTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;

