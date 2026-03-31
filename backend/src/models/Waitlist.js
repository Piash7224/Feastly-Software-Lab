import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema({
    restaurant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Restaurant", 
        required: true 
    },
    customerName: { 
        type: String, 
        required: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: { 
        type: Date, 
        required: true 
    },
    requestedStartTime: { 
        type: Date, 
        required: true 
    },
    requestedEndTime: { 
        type: Date, 
        required: true,
        validate: {
            validator: function (value) {
                return value > this.requestedStartTime;
            },
            message: "requestedEndTime must be later than requestedStartTime"
        }
    },
    partySize: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["waiting","booked", "seated","completed", "cancelled"], 
        default: "waiting" 
    },
    estimatedAvailableTime: { 
        type: Date 
    },
    queuePosition: { 
        type: Number, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

waitlistSchema.pre("save", async function (next) {
    if (!this.queuePosition) {
        const count = await mongoose.models.Waitlist.countDocuments({
            restaurant: this.restaurant,
            date: this.date,
            status: "waiting"
        });
        this.queuePosition = count + 1;
    }
    next();
});

waitlistSchema.index({ restaurant: 1, date: 1, status: 1 });

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

export default Waitlist;
