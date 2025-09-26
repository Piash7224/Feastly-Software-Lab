import express from "express"
import restaurantRoutes from "./routes/restaurantRoutes.js"
import tableRoutes from "./routes/tableRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import waitlistRoutes from "./routes/waitlistRoutes.js"
import foodRoutes from "./routes/foodRoutes.js"
import { connectDB } from "./config/db.js"
import dotenv from "dotenv"
import rateLimiter from "./middleware/rateLimiter.js"

dotenv.config();
const PORT = process.env.PORT || 5001;

const app = express()

//middleware to handle json data
app.use(express.json())
app.use(rateLimiter);



app.use("/api/restaurants", restaurantRoutes);
app.use("/api/tables", tableRoutes); 
app.use("/api/bookings", bookingRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/foods", foodRoutes);


//optional global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});


//start the server after DB connection is established
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on PORT:", PORT)
    });

});




