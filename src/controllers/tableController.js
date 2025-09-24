import Table from "../models/Table.js";
import Booking from "../models/Booking.js";

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
        const {restaurantId, date, timeSlot}= req.query;
        let tables= await Table.find().populate('restaurant');
        if(restaurantId && date && timeSlot) {
            const queryDate = new Date(date);
            queryDate.setHours(0,0,0,0); 
            const bookedTables = await Booking.find({restaurant: restaurantId, date:queryDate, timeSlot: timeSlot}).select('tableId');
            const bookedTableIds = bookedTables
                    .map(booking => booking.tableId)
                    .filter(id => id)
                    .map(id => id.toString());
            tables = tables.map(table => ({
                ...table.toObject(),
                isAvailable: !bookedTableIds.includes(table._id.toString())

            }));       

        }
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
export async function deleteAllTables(req, res) {
    try {
        await Table.deleteMany({});
        res.json({message: "All tables deleted successfully"});
    }catch (error) {
        console.error("Error deleting all Tables:", error);
        res.status(500).json({message: "Server Error"});
    }
}

export async function getAvailableTables(req, res) {
    try {
        const { restaurantId, date, timeSlot } = req.query;
        if(!restaurantId || !date || !timeSlot) {
            return res.status(400).json({message: "RestaurantId, date and timeslot are required"});
        }
        //find all tables for the restaurant
        const allTables = await Table.find({ restaurant: restaurantId});

        //find all bookings for the restaurant on the given date and timeslot
        const queryDate = new Date(date);
        queryDate.setHours(0,0,0,0); //normalize time
        const bookedTables = await Booking.find({restaurant: restaurantId, date:queryDate, timeSlot: timeSlot}).select('tableId');

        //get booked table ids
        const bookedTableIds = bookedTables
             .map(booking => booking.tableId)
             .filter(id => id) 
             .map(id => id.toString());
                                              
        

        //filter out booked tables
        const availableTables = allTables.filter(table => !bookedTableIds.includes(table._id.toString()));
        res.json(availableTables);


    }catch (error) {
        console.error("Error fetching available tables:", error);
        res.status(500).json({message: "Server Error"});
    }
}