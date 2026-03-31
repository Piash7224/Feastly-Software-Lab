import Booking from "../models/Booking.js";
import Table from "../models/Table.js";
import Restaurant from "../models/Restaurant.js";
import Waitlist from "../models/Waitlist.js";
import { createWaitlistEntry } from "./waitlistController.js";

const BUFFER_MINUTES = 30; // Central buffer constant

// ===== Helpers =====
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function parseTimeToDate(queryDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const d = new Date(queryDate);
  d.setHours(hh, mm || 0, 0, 0);
  return d;
}

function isWithinWorkingHours(restaurant, startDt, endDt) {
  if (!restaurant.openingHour || !restaurant.closingHour) return true;
  const day = new Date(startDt);
  day.setHours(0, 0, 0, 0);
  const openDt = parseTimeToDate(day, restaurant.openingHour);
  const closeDt = parseTimeToDate(day, restaurant.closingHour);
  if (closeDt <= openDt) closeDt.setDate(closeDt.getDate() + 1);
  return startDt >= openDt && endDt <= closeDt;
}

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// ===== Auto-assign waitlist =====
async function autoAssignWaitlist(restaurantId) {
  try {
    const rest = await Restaurant.findById(restaurantId);
    if (!rest) return;

    const allTables = await Table.find({ restaurant: restaurantId });
    const waitlist = await Waitlist.find({
      restaurant: restaurantId,
      status: "waiting",
    }).sort({ requestedStartTime: 1 });

    for (const entry of waitlist) {
      const { partySize, requestedStartTime, requestedEndTime, customerName, date } = entry;
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);

      // Step 1: Try single table
      let assigned = false;
      for (const table of allTables) {
        if (table.capacity < parseInt(partySize)) continue;

        const bookings = await Booking.find({
          restaurant: restaurantId,
          tableId: table._id,
          date: queryDate,
        });

        let isAvailable = true;
        for (const b of bookings) {
          const bufferedStart = addMinutes(new Date(b.startTime), -BUFFER_MINUTES);
          const bufferedEnd = addMinutes(new Date(b.endTime), BUFFER_MINUTES);
          if (intervalsOverlap(requestedStartTime, requestedEndTime, bufferedStart, bufferedEnd)) {
            isAvailable = false;
            break;
          }
        }

        if (isAvailable) {
          await Booking.create({
            restaurant: restaurantId,
            tableId: table._id,
            customerName,
            date: queryDate,
            startTime: requestedStartTime,
            endTime: requestedEndTime,
            partySize: parseInt(partySize),
          });
          entry.status = "booked";
          await entry.save();
          assigned = true;
          break;
        }
      }

      // Step 2: Split across multiple tables
      if (!assigned) {
        let remainingParty = parseInt(partySize);
        const selectedTables = [];

        for (const table of allTables) {
          if (remainingParty <= 0) break;

          const bookings = await Booking.find({
            restaurant: restaurantId,
            tableId: table._id,
            date: queryDate,
          });

          let isAvailable = true;
          for (const b of bookings) {
            const bufferedStart = addMinutes(new Date(b.startTime), -BUFFER_MINUTES);
            const bufferedEnd = addMinutes(new Date(b.endTime), BUFFER_MINUTES);
            if (intervalsOverlap(requestedStartTime, requestedEndTime, bufferedStart, bufferedEnd)) {
              isAvailable = false;
              break;
            }
          }

          if (isAvailable) {
            selectedTables.push(table._id);
            remainingParty -= table.capacity;
          }
        }

        if (remainingParty <= 0 && selectedTables.length > 0) {
          const perTableParty = Math.ceil(parseInt(partySize) / selectedTables.length);
          for (const tableId of selectedTables) {
            await Booking.create({
              restaurant: restaurantId,
              tableId,
              customerName,
              date: queryDate,
              startTime: requestedStartTime,
              endTime: requestedEndTime,
              partySize: perTableParty,
            });
          }
          entry.status = "booked";
          await entry.save();
          assigned = true;
        }
      }

      // Step 3: Leave in waiting
      if (!assigned) {
        entry.status = "waiting";
        await entry.save();
      }
    }
  } catch (error) {
    console.error("❌ Error in autoAssignWaitlist:", error);
  }
}

// ===== Create Booking =====
export async function createBooking(req, res) {
  try {
    const { restaurant, customerName, date, timeSlot, partySize, duration, preOrders } = req.body;

    if (!restaurant || !customerName || !date || !timeSlot || !partySize) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) return res.status(400).json({ message: "Invalid date format" });
    queryDate.setHours(0, 0, 0, 0);

    const rest = await Restaurant.findById(restaurant);
    if (!rest) return res.status(404).json({ message: "Restaurant not found" });

    const requestedStart = parseTimeToDate(queryDate, timeSlot);
    const requestedDuration = duration ? parseInt(duration) : 90;
    const requestedEnd = addMinutes(requestedStart, requestedDuration);

    const allTables = await Table.find({ restaurant });
    if (!allTables.length) {
      return res.status(400).json({ message: "No tables configured for this restaurant" });
    }

    const candidateTables = [];

    for (const table of allTables) {
      if (table.capacity < parseInt(partySize)) continue;

      const tableDuration = requestedDuration || table.defaultDuration || 90;
      const tableEnd = addMinutes(requestedStart, tableDuration);

      if (!isWithinWorkingHours(rest, requestedStart, tableEnd)) continue;

      const bookingsForTable = await Booking.find({
        restaurant,
        tableId: table._id,
        date: queryDate,
      }).sort({ startTime: 1 });

      let isAvailable = true;
      for (const b of bookingsForTable) {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        const bufferedStart = addMinutes(bStart, -BUFFER_MINUTES);
        const bufferedEnd = addMinutes(bEnd, BUFFER_MINUTES);

        if (intervalsOverlap(requestedStart, tableEnd, bufferedStart, bufferedEnd)) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) candidateTables.push({ table, tableDuration });
    }

    if (candidateTables.length) {
      candidateTables.sort((a, b) => a.table.capacity - b.table.capacity);
      const chosen = candidateTables[0];
      const chosenTable = chosen.table;
      const chosenEnd = addMinutes(requestedStart, chosen.tableDuration);

      const booking = await Booking.create({
        restaurant,
        tableId: chosenTable._id,
        customerName,
        userId: req.user.id, // Add userId
        date: queryDate,
        startTime: requestedStart,
        endTime: chosenEnd,
        partySize: parseInt(partySize),
        preOrders: preOrders || [],
      });

      await autoAssignWaitlist(restaurant);

      return res.status(201).json({
        message: "Booking confirmed",
        booking,
        table: chosenTable,
      });
    }

    // No table → calculate next available & add to waitlist
    const tableAvailability = [];
    for (const table of allTables) {
      if (table.capacity < parseInt(partySize)) continue;

      const bookingsForTable = await Booking.find({
        restaurant,
        tableId: table._id,
        date: queryDate,
      }).sort({ startTime: 1 });

      const tableDuration = requestedDuration || table.defaultDuration || 90;
      let cursor = new Date(requestedStart);

      const openDt = rest.openingHour ? parseTimeToDate(queryDate, rest.openingHour) : null;
      const closeDt = rest.closingHour ? parseTimeToDate(queryDate, rest.closingHour) : null;
      if (openDt && cursor < openDt) cursor = new Date(openDt);

      let foundGapAt = null;
      for (const b of bookingsForTable) {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        const bufferedStart = addMinutes(bStart, -BUFFER_MINUTES);
        const bufferedEnd = addMinutes(bEnd, BUFFER_MINUTES);

        if (addMinutes(cursor, tableDuration) <= bufferedStart) {
          foundGapAt = cursor;
          break;
        }
        if (bufferedEnd > cursor) cursor = new Date(bufferedEnd);
      }

      if (!foundGapAt) foundGapAt = cursor;

      if (!closeDt || addMinutes(foundGapAt, tableDuration) <= closeDt) {
        tableAvailability.push({
          tableId: table._id,
          tableNumber: table.number || table.tableNumber,
          capacity: table.capacity,
          availableAt: foundGapAt,
          bookings: bookingsForTable.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
            preOrders: b.preOrders || [],
          })),
        });
      }
    }

    tableAvailability.sort((a, b) => a.availableAt - b.availableAt);
    const earliest = tableAvailability.length > 0 ? tableAvailability[0].availableAt : null;

    const waitlistEntry = await createWaitlistEntry({
      restaurant,
      customerName,
      date,
      requestedStartTime: requestedStart,
      requestedEndTime: requestedEnd,
      partySize: parseInt(partySize),
      estimatedAvailableTime: earliest,
    });

    await autoAssignWaitlist(restaurant);

    return res.status(200).json({
      message: "No available tables at your requested time for this party size.",
      waitlistOption: true,
      earliestAvailableTime: earliest,
      tableAvailability,
      waitlistInfo: { waitlistEntry, estimatedAvailableTime: earliest },
    });
  } catch (error) {
    console.error("❌ Error creating Booking:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}
// GET table availability for customer
export async function getAvailableTables(req, res) {
  try {
    const restaurantId = req.params.id;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date query parameter is required" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const tables = await Table.find({ restaurant: restaurantId });
    const bookings = await Booking.find({
      restaurant: restaurantId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const availability = tables.map((table) => {
      const tableBookings = bookings.filter((b) => b.tableId.toString() === table._id.toString());
      return {
        tableId: table._id,
        tableNumber: table.number || table.tableNumber,
        capacity: table.capacity,
        bookings: tableBookings.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      };
    });

    return res.json({ tables: availability });
  } catch (error) {
    console.error("❌ Error in getAvailableTables:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// ===== Get bookings by restaurant & date =====
export async function getBookingsByRestaurantAndDate(req, res) {
  try {
    const { restaurantId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: "Date query parameter is required" });

    const startOfDay = new Date(date);
    if (isNaN(startOfDay.getTime())) return res.status(400).json({ message: "Invalid date format" });
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const allTables = await Table.find({ restaurant: restaurantId });
    const bookings = await Booking.find({
      restaurant: restaurantId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("tableId");

    const tableBookingsMap = {};
    allTables.forEach((table) => {
      tableBookingsMap[table._id.toString()] = {
        tableId: table._id.toString(),
        tableNumber: table.number || table.tableNumber,
        capacity: table.capacity,
        bookings: [],
      };
    });

    bookings.forEach((booking) => {
      if (booking.tableId && booking.tableId._id) {
        const tableId = booking.tableId._id.toString();
        if (tableBookingsMap[tableId]) {
          const bookingData =
            req.user.role === "customer"
              ? { startTime: booking.startTime, endTime: booking.endTime, preOrders: booking.preOrders || [] }
              : booking; // full booking for owner/admin
          tableBookingsMap[tableId].bookings.push(bookingData);
        }
      }
    });

    return res.json({
      tables: Object.values(tableBookingsMap),
      message: req.user.role === "customer" ? "Customer-accessible table availability fetched" : "Full table bookings fetched",
    });
  } catch (error) {
    console.error("❌ Error fetching bookings by restaurant/date:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// ===== Get all bookings =====
export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find().populate("restaurant").populate("tableId");
    return res.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching Bookings:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// ===== Delete single booking =====
export async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await autoAssignWaitlist(booking.restaurant);
    return res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting Booking:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// ===== Delete all bookings =====
export async function deleteAllBookings(req, res) {
  try {
    await Booking.deleteMany({});
    return res.json({ message: "All bookings deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting all Bookings:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}
