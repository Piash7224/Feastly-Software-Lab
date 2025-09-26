import Waitlist from "../models/Waitlist.js";


//add to waitlist
export async function addToWaitlist(req, res) {
    try {
        const { restaurant, customerName, date, timeSlot, partySize } = req.body;
        const queryDate = new Date(date);
        queryDate.setHours(0,0,0,0);

        const entry = await Waitlist.create({
            restaurant,
            customerName,
            date: queryDate,
            timeSlot,
            partySize
        });
        res.status(201).json(entry);
    }catch (error) {
        console.error("Error adding to Waitlist:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//get waitlist

export async function getWaitlist(req, res) {
    try{
        const {restaurantId, date, timeSlot}= req.query;
        let filter = {};
        if(restaurantId) filter.restaurant = restaurantId;
        if(date){
            const queryDate = new Date(date);
            queryDate.setHours(0,0,0,0);
            filter.date = queryDate;
        }
        if(timeSlot) filter.timeSlot = timeSlot;
        const list = await Waitlist.find(filter).populate('restaurant');
        res.json(list);
    }catch (error) {
        console.error("Error fetching Waitlist:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//update waitlist status
export async function updateWaitlistStatus(req, res){
    try {
        const{status}= req.body;
        const allowedStatuses = ['waiting', 'seated', 'cancelled'];
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`});
            
        }
        const entry = await Waitlist.findByIdAndUpdate(req.params.id,{status}, {new: true});
        if(!entry) return res.status(404).json({message: "Waitlist entry not found"});
        res.json(entry);
    }catch (error) {
        console.error("Error updating Waitlist entry:", error);
        res.status(500).json({message: "Server Error"});
    }
}

//remove from waitlist
export async function removeFromWaitlist(req, res){
    try{
        const entry = await Waitlist.findByIdAndDelete(req.params.id);
        if(!entry) return res.status(404).json({message: "Waitlist entry not found"});
        res.json({message: "Waitlist entry removed successfully"});
    }catch (error) {
        console.error("Error removing Waitlist entry:", error);
        res.status(500).json({message: "Server Error"});
    }
}