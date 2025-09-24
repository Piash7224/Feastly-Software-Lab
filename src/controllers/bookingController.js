import Booking from "../models/Booking.js";
import Waitlist from "../models/Waitlist.js";
import Table from "../models/Table.js";



//create a booking
export async function createBooking (req, res) {
    try {
        
        const { restaurant, tableId, customerName, date, timeSlot, partySize } = req.body;

        const queryDate = new Date(date);
        queryDate.setHours(0,0,0,0);

        //check if the table is already booked for the given timeslot
        const existingBooking = await Booking.findOne({ tableId, date: queryDate, timeSlot});
        if (existingBooking) {
            const waitlistEntry = await Waitlist.create({ restaurant, customerName, date: queryDate, timeSlot, partySize });
            return res.status(200).json({message: "Table is already booked. You have been added to the waitlist.", waitlistEntry});
        
        } 

        const booking = await Booking.create({ restaurant, tableId, customerName, date: queryDate, timeSlot, partySize });
        res.status(201).json(booking); 
    }catch (error) {
        console.error("Error creating Booking:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//get all bookings
export async function getAllBookings(req, res) {
    try{
        const bookings = await Booking.find().populate('restaurant').populate('tableId');
        res.json(bookings);
    }catch (error) {
        console.error("Error fetching Bookings:", error);
        res.status(500).json({message: "Server Error"});
    }
}
//delete a booking
export async function deleteBooking(req, res) {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if(!booking) return res.status(404).json({message: "Booking not found"});
        res.json({message: "Booking deleted successfully"});
    }catch (error) {
        console.error("Error deleting Booking:", error);
        res.status(500).json({message: "Server Error"});
    }
}
//delete all bookings
export async function deleteAllBookings(req, res) {
    try {
        await Booking.deleteMany({});
        res.json({message: "All bookings deleted successfully"});
    }catch (error) {
        console.error("Error deleting all Bookings:", error);
        res.status(500).json({message: "Server Error"});
    }

}