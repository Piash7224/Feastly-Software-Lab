import Table from "../models/Table.js";
import Booking from "../models/Booking.js";

// ===== CREATE a table =====
export async function createTable(req, res) {
    try {
        const { restaurant, number, capacity, position, shape, size } = req.body;

        if (!restaurant || !number || !capacity) {
            return res.status(400).json({ message: "restaurant, number, and capacity are required" });
        }

        const allowedShapes = ["circle", "rectangle", "square"];
        if (shape && !allowedShapes.includes(shape)) {
            return res.status(400).json({ message: `Invalid shape. Allowed shapes are: ${allowedShapes.join(", ")}` });
        }

        const table = await Table.create({
            restaurant,
            number,
            capacity,
            position: position || { x: 0, y: 0 },
            shape: shape || "circle",
            size: size || { width: 50, height: 50 }
        });

        res.status(201).json(table);
    } catch (error) {
        console.error("Error creating Table:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ===== GET all tables =====
export async function getAllTables(req, res) {
    try {
        let tables = await Table.find().populate("restaurant");
        res.json(tables);
    } catch (error) {
        console.error("Error fetching Tables:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ===== GET tables by restaurant ID =====
export async function getTablesByRestaurant(req, res) {
    try {
        const { restaurantId } = req.params;
        const tables = await Table.find({ restaurant: restaurantId });
        res.json(tables);
    } catch (error) {
        console.error("Error fetching Tables by restaurant:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ===== UPDATE a table =====
export async function updateTable(req, res) {
    try {
        const { number, capacity, position, shape, size } = req.body;

        const allowedShapes = ["circle", "rectangle", "square"];
        if (shape && !allowedShapes.includes(shape)) {
            return res.status(400).json({ message: `Invalid shape. Allowed shapes are: ${allowedShapes.join(", ")}` });
        }

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            {
                number,
                capacity,
                position: position || { x: 0, y: 0 },
                shape: shape || "circle",
                size: size || { width: 50, height: 50 }
            },
            { new: true }
        );

        if (!table) return res.status(404).json({ message: "Table not found" });

        res.json(table);
    } catch (error) {
        console.error("Error updating Table:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ===== DELETE a table =====
export async function deleteTable(req, res) {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);
        if (!table) return res.status(404).json({ message: "Table not found" });

        res.json({ message: "Table deleted successfully" });
    } catch (error) {
        console.error("Error deleting Table:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ===== DELETE all tables =====
export async function deleteAllTables(req, res) {
    try {
        await Table.deleteMany({});
        res.json({ message: "All tables deleted successfully" });
    } catch (error) {
        console.error("Error deleting all Tables:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ===== GET available tables (with working hours + overlap check) =====
export async function getAvailableTables(req, res) {
    try {
        const { restaurantId, date, startTime, duration, partySize } = req.query;

        if (!restaurantId || !date || !startTime || !duration || !partySize) {
            return res.status(400).json({
                message: "restaurantId, date, startTime, duration, and partySize are required"
            });
        }

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const bookingStart = new Date(`${date}T${startTime}`);
        const bookingEnd = new Date(bookingStart.getTime() + parseInt(duration) * 60000); // duration in minutes

        const allTables = await Table.find({ restaurant: restaurantId });

        const bookedTables = await Booking.find({
            restaurant: restaurantId,
            date: queryDate,
            $or: [
                { startTime: { $lt: bookingEnd }, endTime: { $gt: bookingStart } } // overlap check
            ]
        }).select("tableId startTime endTime");

        const bookedTableIds = bookedTables.map(b => b.tableId?.toString());

        let availableTables = allTables.filter(
            (table) => !bookedTableIds.includes(table._id.toString())
        );

        availableTables = availableTables.filter(
            (table) => table.capacity >= parseInt(partySize)
        );

        availableTables.sort((a, b) => a.capacity - b.capacity);

        if (availableTables.length > 0) {
            return res.json(availableTables);
        }

        // === If no tables available, suggest earliest estimated availability ===
        let nextAvailable = {};
        allTables.forEach(table => {
            const bookingsForTable = bookedTables.filter(b => b.tableId?.toString() === table._id.toString());
            if (bookingsForTable.length > 0) {
                const earliestEnd = bookingsForTable.reduce((min, b) =>
                    b.endTime < min ? b.endTime : min, bookingsForTable[0].endTime);
                nextAvailable[table.number] = earliestEnd;
            } else {
                nextAvailable[table.number] = bookingStart; // already free
            }
        });

        return res.status(200).json({
            message: "No tables available at requested time.",
            estimatedAvailability: nextAvailable
        });

    } catch (error) {
        console.error("Error fetching available tables:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
