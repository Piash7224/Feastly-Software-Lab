import Booking from "../models/Booking.js";

//create a booking
export async function createBooking (req, res) {
    try {
        const { restaurant, tableId, customerName, date, timeSlot } = req.body;

        //check if the table is already booked for the given timeslot
        const existingBooking = await Booking.findOne({ tableId, date, timeSlot});
        if (existingBooking) {
            return res.status(400).json({ message: "Table is already booked for this timeslot"});
        
        } 

        const booking = await Booking.create({ restaurant, tableId, customerName, date, timeSlot});
        res.status(201).json(booking); 
    }catch (error) {
        console.error("Error creating Booking:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//get all bookings
export async function getAllBookings(req, res) {
    try{
        const bookings = await Booking.find().populate('restaurant').populate('table');
        res.json(bookings);
    }catch (error) {
        console.error("Error fetching Bookings:", error);
        res.status(500).json({message: "Server Error"});
    }
}