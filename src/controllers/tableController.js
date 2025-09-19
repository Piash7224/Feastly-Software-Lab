import Table from "../models/Table.js";

//create a table

export async function createTable (req, res) {
    try {
        const table = await Table.create(req.body);
        res.status(201).json(table);
    }catch (error) {
        console.error("Error creating Table:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//get all tables
export async function getAllTables(req, res) {
    try{
        const tables = await Table.find().populate('restaurant');
        res.json(tables);
    }catch (error) {
        console.error("Error fetching Tables:", error);
        res.status(500).json({message: "Server Error"});
    } 
}

//update table

export async function updateTable(req, res) {
    try{
        const table = await Table.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!table) return res.status(404).json({message: "Table not found"});
        res.json(table);
    }catch (error) {
        console.error("Error updating Table:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//delete a table

export async function deleteTable(req, res) {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);
        if(!table) return res.status(404).json({message: "Table not found"});
        res.json({message: "Table deleted successfully"});
    } catch (error) {
        console.error("Error deleting Table:", error);
        res.status(500).json({message: "Server Error"});
    }
}