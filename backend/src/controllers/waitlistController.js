import Waitlist from "../models/Waitlist.js";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";

const BUFFER_MINUTES = 30;

// Add minutes to date
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// Calculate free periods for a table
function calculateFreePeriods(bookings, openingTime, closingTime, bufferMinutes = BUFFER_MINUTES) {
  let periods = [];
  let lastEnd = openingTime;

  bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  for (const booking of bookings) {
    const start = addMinutes(new Date(booking.startTime), -bufferMinutes);
    const end = addMinutes(new Date(booking.endTime), bufferMinutes);

    if (lastEnd < start) {
      periods.push({ from: lastEnd, to: start });
    }

    lastEnd = end > lastEnd ? end : lastEnd;
  }

  if (lastEnd < closingTime) {
    periods.push({ from: lastEnd, to: closingTime });
  }

  return periods;
}

// Check if table available for requested time
function isTableAvailableForPeriod(periods, requestedStartTime, requestedEndTime) {
  for (const period of periods) {
    if (requestedStartTime >= period.from && requestedEndTime <= period.to) {
      return true;
    }
  }
  return false;
}

// Find earliest available time from periods
function findEarliestAvailableTime(periods, requestedStartTime) {
  for (const period of periods) {
    if (requestedStartTime >= period.from && requestedStartTime <= period.to) {
      return requestedStartTime;
    }
    if (requestedStartTime < period.from) {
      return period.from;
    }
  }
  return null;
}

// Create waitlist entry
export async function createWaitlistEntry({
  restaurant,
  customerName,
  date,
  requestedStartTime,
  requestedEndTime,
  partySize,
  estimatedAvailableTime = null,
}) {
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);

  const allTables = await Table.find({ restaurant, capacity: { $gte: partySize } }).lean();
  const tableIds = allTables.map(t => t._id);

  // Batch bookings query
  const bookings = await Booking.find({
    restaurant,
    tableId: { $in: tableIds },
    date: queryDate,
  }).sort({ startTime: 1 }).lean();

  const bookingsByTable = bookings.reduce((acc, booking) => {
    acc[booking.tableId] = acc[booking.tableId] || [];
    acc[booking.tableId].push(booking);
    return acc;
  }, {});

  const openingTime = new Date(queryDate);
  openingTime.setHours(10, 0, 0, 0); // Example: opening at 10:00
  const closingTime = new Date(queryDate);
  closingTime.setHours(22, 0, 0, 0); // Example: closing at 22:00

  const tableAvailability = [];

  for (const table of allTables) {
    const bookingsForTable = bookingsByTable[table._id] || [];
    const freePeriods = calculateFreePeriods(bookingsForTable, openingTime, closingTime, BUFFER_MINUTES);

    let availableAt = findEarliestAvailableTime(freePeriods, requestedStartTime);

    const available = isTableAvailableForPeriod(freePeriods, requestedStartTime, requestedEndTime);

    if (!available) {
      availableAt = findEarliestAvailableTime(freePeriods, requestedStartTime);
    }

    tableAvailability.push({
      tableId: table._id,
      tableNumber: table.tableNumber || table._id,
      capacity: table.capacity,
      availableAt,
      freePeriods
    });
  }

  tableAvailability.sort((a, b) => {
    if (a.availableAt.getTime() === b.availableAt.getTime()) {
      return a.capacity - b.capacity;
    }
    return a.availableAt - b.availableAt;
  });

  const earliest =
    estimatedAvailableTime ||
    (tableAvailability.length > 0 ? tableAvailability[0].availableAt : null);

  const queueCount = await Waitlist.countDocuments({
    restaurant,
    date: queryDate,
    status: "waiting",
  });

  const entry = await Waitlist.create({
    restaurant,
    customerName,
    date: queryDate,
    requestedStartTime,
    requestedEndTime,
    partySize,
    estimatedAvailableTime: earliest || null,
    status: "waiting",
    queuePosition: queueCount + 1,
  });

  console.log("📝 Waitlist entry created:", {
    id: entry._id,
    name: customerName,
    estimatedAvailableTime: earliest,
    queuePosition: queueCount + 1,
  });

  return { entry, tableAvailability, estimatedAvailableTime: earliest };
}
// Check waitlist availability
export async function checkWaitlistAvailability(req, res) {
  try {
    const { restaurant, requestedStartTime, requestedEndTime, partySize, date } = req.body;
    if (!restaurant || !requestedStartTime || !requestedEndTime || !partySize || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const allTables = await Table.find({ restaurant, capacity: { $gte: partySize } }).lean();
    const tableIds = allTables.map(t => t._id);

    const bookings = await Booking.find({
      restaurant,
      tableId: { $in: tableIds },
      date: queryDate,
    }).sort({ startTime: 1 }).lean();

    const bookingsByTable = bookings.reduce((acc, booking) => {
      acc[booking.tableId] = acc[booking.tableId] || [];
      acc[booking.tableId].push(booking);
      return acc;
    }, {});

    const openingTime = new Date(queryDate);
    openingTime.setHours(10, 0, 0, 0);
    const closingTime = new Date(queryDate);
    closingTime.setHours(22, 0, 0, 0);

    const tableAvailability = [];

    for (const table of allTables) {
      const bookingsForTable = bookingsByTable[table._id] || [];
      const freePeriods = calculateFreePeriods(bookingsForTable, openingTime, closingTime);

      let availableAt = findEarliestAvailableTime(freePeriods, new Date(requestedStartTime));

      tableAvailability.push({
        tableId: table._id,
        tableNumber: table.tableNumber || table._id,
        capacity: table.capacity,
        availableAt,
        freePeriods
      });
    }

    tableAvailability.sort((a, b) => {
      if (a.availableAt.getTime() === b.availableAt.getTime()) {
        return a.capacity - b.capacity;
      }
      return a.availableAt - b.availableAt;
    });

    const earliest = tableAvailability.length > 0 ? tableAvailability[0].availableAt : null;

    res.status(200).json({
      tableAvailability,
      estimatedAvailableTime: earliest,
    });
  } catch (error) {
    console.error(" Error checking waitlist availability:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}


// ------------------------
// AUTO-SEAT WAITLIST
// ------------------------
export async function autoSeatWaitlist(restaurantId) {
  if (!restaurantId) return;

  const now = new Date();

  const waitingEntries = await Waitlist.find({
    restaurant: restaurantId,
    status: "waiting",
    requestedStartTime: { $lte: now },
  });

  for (const entry of waitingEntries) {
    entry.status = "seated";
    await entry.save();
    console.log(`✅ Auto-seated: ${entry.customerName} at ${entry.requestedStartTime}`);
  }

  return waitingEntries.length;
}

// FIFO Processor: Auto-assign table from waitlist
export async function processWaitlistForTable(restaurantId) {
  if (!restaurantId) return null;

  const waitlistEntries = await Waitlist.find({
    restaurant: restaurantId,
    status: "waiting",
  })
    .sort({ queuePosition: 1 })
    .exec();

  if (!waitlistEntries || waitlistEntries.length === 0) return null;

  const tableIds = await Table.find({ restaurant: restaurantId }).distinct("_id");

  const bookings = await Booking.find({
    restaurant: restaurantId,
    tableId: { $in: tableIds },
  }).sort({ startTime: 1 }).lean();

  const bookingsByTable = bookings.reduce((acc, booking) => {
    acc[booking.tableId] = acc[booking.tableId] || [];
    acc[booking.tableId].push(booking);
    return acc;
  }, {});

  for (const entry of waitlistEntries) {
    const { date, requestedStartTime, requestedEndTime, partySize } = entry;
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const allTables = await Table.find({
      restaurant: restaurantId,
      capacity: { $gte: partySize },
    }).sort({ capacity: 1 }).lean();

    const openingTime = new Date(queryDate);
    openingTime.setHours(10, 0, 0, 0);
    const closingTime = new Date(queryDate);
    closingTime.setHours(22, 0, 0, 0);

    for (const table of allTables) {
      const freePeriods = calculateFreePeriods(bookingsByTable[table._id] || [], openingTime, closingTime);

      if (isTableAvailableForPeriod(freePeriods, requestedStartTime, requestedEndTime)) {
        const booking = await Booking.create({
          restaurant: restaurantId,
          tableId: table._id,
          customerName: entry.customerName,
          date: queryDate,
          startTime: new Date(requestedStartTime),
          endTime: new Date(requestedEndTime),
          partySize,
        });

        await Waitlist.findByIdAndUpdate(entry._id, {
          status: "booked",
          estimatedAvailableTime: new Date(requestedStartTime),
        });

        console.log(
          ` Waitlist entry auto-booked: ${entry.customerName} → Table ${table.tableNumber || table._id}`
        );

        return booking;
      }
    }
  }

  return null;
}

// Add to waitlist
export async function addToWaitlist(req, res) {
  try {
    const { restaurant, customerName, date, requestedStartTime, requestedEndTime, partySize } = req.body;

    if (!restaurant || !customerName || !date || !requestedStartTime || !requestedEndTime || !partySize) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const waitlistData = await createWaitlistEntry({
      restaurant,
      customerName,
      date,
      requestedStartTime: new Date(requestedStartTime),
      requestedEndTime: new Date(requestedEndTime),
      partySize,
    });

    const restaurantId = typeof restaurant === "object" && restaurant._id ? restaurant._id : restaurant;

    // Call auto-seat function here
    await autoSeatWaitlist(restaurantId);

    await processWaitlistForTable(restaurantId);

    res.status(201).json({
      message: "Added to waitlist successfully",
      waitlistEntry: waitlistData.entry,
      tableAvailability: waitlistData.tableAvailability,
      estimatedAvailableTime: waitlistData.estimatedAvailableTime,
    });
  } catch (error) {
    console.error(" Error adding to Waitlist:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}


// Get waitlist entries

export async function getWaitlist(req, res) {
  try {
    const { restaurantId, date } = req.query;
    const filter = {};

    if (restaurantId) filter.restaurant = restaurantId;
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      filter.date = queryDate;
    }

    const list = await Waitlist.find(filter).sort({ queuePosition: 1 }).populate("restaurant").lean();
    res.status(200).json(list);
  } catch (error) {
    console.error(" Error fetching Waitlist:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// Update waitlist status

export async function updateWaitlistStatus(req, res) {
  try {
    const { status, estimatedAvailableTime } = req.body;
    const allowedStatuses = ["waiting", "booked", "seated", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const updateData = { status };
    if (estimatedAvailableTime) updateData.estimatedAvailableTime = estimatedAvailableTime;

    const entry = await Waitlist.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!entry) return res.status(404).json({ message: "Waitlist entry not found" });

    res.status(200).json({
      message: "Waitlist entry updated successfully",
      waitlistEntry: entry,
    });
  } catch (error) {
    console.error(" Error updating Waitlist entry:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}


// Remove from waitlist

export async function removeFromWaitlist(req, res) {
  try {
    const entry = await Waitlist.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Waitlist entry not found" });

    await processWaitlistForTable(entry.restaurant);

    res.status(200).json({ message: "Waitlist entry removed successfully" });
  } catch (error) {
    console.error(" Error removing Waitlist entry:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// ============================
// Delete all waitlist entries
// ============================
export async function deleteAllWaitlist(req, res) {
  try {
    const result = await Waitlist.deleteMany({});
    res.status(200).json({
      message: "All waitlist entries removed successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(" Error deleting all Waitlist entries:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
