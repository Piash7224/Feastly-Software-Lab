import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";
import "../Styles/bookingStyles.css";
import "../Styles/menuCard.css";
import MenuCard from "../components/MenuCard";
import { motion, AnimatePresence } from "framer-motion";

// Buffer time in minutes to add before and after bookings
const BUFFER_MINUTES = 15;

export default function Booking() {
  const { restaurantId } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [foodMenu, setFoodMenu] = useState([]);
  const [preOrders, setPreOrders] = useState([]);

  const [showMenuCard, setShowMenuCard] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");
  const [waitlistInfo, setWaitlistInfo] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(120);
  const [loading, setLoading] = useState(false);
  const [tableAvailability, setTableAvailability] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [earliestAvailableTime, setEarliestAvailableTime] = useState(null);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [seatsDisabled, setSeatsDisabled] = useState(false);
  const [conflictingTables, setConflictingTables] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [userWaitlist, setUserWaitlist] = useState([]);
  const [bookingConflict, setBookingConflict] = useState(null);
  const [waitlistConflict, setWaitlistConflict] = useState(null);

  // ======= Fetch restaurant & food menu =======
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axiosInstance.get(`/restaurants/${restaurantId}`);
        setRestaurant(res.data);

        const foodRes = await axiosInstance.get(`/foods/restaurant/${restaurantId}`);
        setFoodMenu(foodRes.data || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load restaurant data.");
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // ======= Fetch tables & waitlist when date changes =======
  useEffect(() => {
    if (bookingDate && restaurantId) {
      fetchTableAvailability();
      fetchWaitlist();
    }
  }, [bookingDate, restaurantId]);

  useEffect(() => {
    if (timeSlot && bookingDate && restaurantId && partySize > 0) {
      setSelectedTableId(null);
      updateAvailabilityAndWaitlist();
    }
    if (!timeSlot) {
      setEarliestAvailableTime(null);
      setWaitlistInfo(null);
    }
  }, [timeSlot, partySize, bookingDate, restaurantId]);

  const parseTimeToDate = (date, timeStr) => {
    const [hh, mm] = timeStr.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh, mm || 0, 0, 0);
    return d;
  };

  const isTableBooked = (table, startTime = null, durationOverride = null) => {
    if (!timeSlot && !startTime) return false;
    const selectedTime = startTime || parseTimeToDate(bookingDate, timeSlot);
    const dur = durationOverride || duration;
    const requestedEnd = new Date(selectedTime.getTime() + dur * 60000);

    return table.bookings?.some((b) => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const bufferedEnd = new Date(end.getTime() + BUFFER_MINUTES * 60000);
      const bufferedStart = new Date(start.getTime() - BUFFER_MINUTES * 60000);
      return selectedTime < bufferedEnd && requestedEnd > bufferedStart;
    });
  };

  const canAccommodateParty = (table) => {
    const capacity = table.capacity || 0;
    return capacity >= partySize;
  };

  const sortedTables = [...tableAvailability].sort((a, b) => {
    const capDiff = (a.capacity || 0) - (b.capacity || 0);
    if (capDiff !== 0) return capDiff;
    const aNum = a.tableNumber || a.tableId || 0;
    const bNum = b.tableNumber || b.tableId || 0;
    return aNum - bNum;
  });

  // ======= Fetch table availability (customer-safe route) =======
  const fetchTableAvailability = async () => {
    try {
      setLoadingAvailability(true);
      const res = await axiosInstance.get(
        `/restaurants/${restaurantId}/availability?date=${bookingDate}`
      );
      setTableAvailability(res.data?.tables || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch table availability.");
    } finally {
      setLoadingAvailability(false);
    }
  };

  // ======= Fetch waitlist =======
  const fetchWaitlist = async () => {
    try {
      const res = await axiosInstance.get(
        `/waitlist?restaurantId=${restaurantId}&date=${bookingDate}`
      );
      const filtered = res.data.filter((entry) =>
        ["waiting", "booked", "seated"].includes(entry.status)
      );
      setWaitlistEntries(filtered || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======= Fetch user's bookings and waitlist entries =======
  const fetchUserBookingsAndWaitlist = async () => {
    try {
      const [bookingsRes, waitlistRes] = await Promise.all([
        axiosInstance.get("/bookings/my-bookings"),
        axiosInstance.get("/waitlist/my-entries"),
      ]);

      setUserBookings(bookingsRes.data || []);
      setUserWaitlist(waitlistRes.data || []);
    } catch (err) {
      console.error("Failed to fetch user bookings:", err);
    }
  };

  // ======= Check for booking conflicts =======
  const checkBookingConflict = () => {
    if (!timeSlot || !bookingDate || !restaurantId || partySize < 1) return null;

    const requestedStart = parseTimeToDate(bookingDate, timeSlot);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);
    const selectedDate = new Date(bookingDate);

    // Check if user already has a booking at this restaurant on this date
    const existingBooking = userBookings.find((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        booking.restaurant === restaurantId &&
        bookingDate.toDateString() === selectedDate.toDateString()
      );
    });

    if (existingBooking) {
      return `You already have a booking at this restaurant on ${selectedDate.toLocaleDateString()}`;
    }

    // Check if user has any conflicting bookings at other restaurants
    const conflictingBooking = userBookings.find((booking) => {
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);
      return requestedStart < bEnd && requestedEnd > bStart;
    });

    if (conflictingBooking) {
      const conflictRestaurant = conflictingBooking.restaurantName || "another restaurant";
      return `You have a conflicting booking at ${conflictRestaurant} from ${bStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} to ${bEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return null;
  };

  // ======= Check for waitlist conflicts =======
  const checkWaitlistConflict = () => {
    if (!timeSlot || !bookingDate || !restaurantId || partySize < 1) return null;

    const selectedDate = new Date(bookingDate);

    // Check if already in waitlist for this restaurant on this date
    const existingWaitlist = userWaitlist.find((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entry.restaurant === restaurantId &&
        entryDate.toDateString() === selectedDate.toDateString() &&
        entry.status !== "cancelled"
      );
    });

    if (existingWaitlist) {
      return `You're already in the waitlist for this restaurant on ${selectedDate.toLocaleDateString()}`;
    }

    return null;
  };

  // ======= Fetch user bookings on mount =======
  useEffect(() => {
    fetchUserBookingsAndWaitlist();
  }, []);

  // ======= Update availability and compute earliest available time =======
  const updateAvailabilityAndWaitlist = async () => {
    if (!timeSlot || !bookingDate || !restaurantId || partySize < 1) {
      setEarliestAvailableTime(null);
      setWaitlistInfo(null);
      setConflictingTables([]);
      return;
    }

    try {
      setLoadingAvailability(true);
      const res = await axiosInstance.get(
        `/restaurants/${restaurantId}/availability?date=${bookingDate}`
      );
      const tables = res.data?.tables || [];
      setTableAvailability(tables);

      const requestedStartTime = parseTimeToDate(bookingDate, timeSlot);
      const requestedEndTime = new Date(requestedStartTime.getTime() + duration * 60000);

      const hasExact = tables.some((t) => (t.capacity || 0) === partySize);
      const suitableTables = tables.filter((t) => {
        const cap = t.capacity || 0;
        return hasExact ? cap === partySize : cap > partySize && cap <= partySize + 1;
      });

      const conflicting = suitableTables.filter((table) => {
        const bookings = table.bookings || [];
        return bookings.some((b) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          const bufferedStart = new Date(start.getTime() - BUFFER_MINUTES * 60000);
          const bufferedEnd = new Date(end.getTime() + BUFFER_MINUTES * 60000);
          return requestedStartTime < bufferedEnd && requestedEndTime > bufferedStart;
        });
      });

      setConflictingTables(conflicting);

      const availableNow = suitableTables.length > 0 && conflicting.length < suitableTables.length;

      if (availableNow) {
        setEarliestAvailableTime(null);
        setWaitlistInfo(null);
        return;
      }

      const availabilityData = suitableTables.map((table) => {
        let availableFrom = requestedStartTime;
        const bookings = table.bookings || [];

        while (
          bookings.some((b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            const bufferedStart = new Date(start.getTime() - BUFFER_MINUTES * 60000);
            const bufferedEnd = new Date(end.getTime() + BUFFER_MINUTES * 60000);
            return availableFrom < bufferedEnd && requestedEndTime > bufferedStart;
          })
        ) {
          const nextBusy = bookings.find((b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            const bufferedStart = new Date(start.getTime() - BUFFER_MINUTES * 60000);
            const bufferedEnd = new Date(end.getTime() + BUFFER_MINUTES * 60000);
            return availableFrom < bufferedEnd && requestedEndTime > bufferedStart;
          });

          availableFrom = new Date(new Date(nextBusy.endTime).getTime() + BUFFER_MINUTES * 60000);
        }

        return { tableId: table.tableId || table._id, availableFrom };
      });

      availabilityData.sort((a, b) => a.availableFrom - b.availableFrom);

      setEarliestAvailableTime(availabilityData[0]?.availableFrom || null);
      setWaitlistInfo({ availabilityData });

    } catch (err) {
      console.error("Error updating availability:", err);
    } finally {
      setLoadingAvailability(false);
    }
  };
  const handlePreOrderChange = (foodId, qty) => {
    setPreOrders((prev) => {
      const existing = prev.find((p) => p.food === foodId);
      if (existing) {
        if (qty === 0) return prev.filter((p) => p.food !== foodId);
        return prev.map((p) => (p.food === foodId ? { food: foodId, quantity: qty } : p));
      }
      return [...prev, { food: foodId, quantity: qty }];
    });
  };

  const handleBooking = async () => {
    if (!timeSlot || !customerName || !partySize || !bookingDate) {
      alert("Please fill all fields.");
      return;
    }

    // 🛑 Check for booking conflicts
    const conflict = checkBookingConflict();
    if (conflict) {
      setMessage(conflict);
      setBookingConflict(conflict);
      return;
    }

    // 🛑 Prevent booking for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part
    const selectedDate = new Date(bookingDate);

    if (selectedDate < today) {
      alert("You cannot book for a past date!");
      return;
    }

    setMessage("");
    setBookingConflict(null);
    setWaitlistInfo(null);
    setEarliestAvailableTime(null);
    setLoading(true);

    try {
      const res = await axiosInstance.post(
        "/bookings",
        {
          restaurant: restaurantId,
          customerName,
          date: bookingDate,
          timeSlot,
          partySize,
          duration,
          preOrders,
          selectedTableId,
        }
      );

      if (res.data.waitlistOption) {
        setWaitlistInfo(res.data);
        setEarliestAvailableTime(res.data.earliestAvailableTime || null);
        setMessage(res.data.message || "No available tables, you can join waitlist.");
        setTableAvailability(res.data.tableAvailability || []);
      } else {
        setMessage(res.data.message || "Booking confirmed!");
        setWaitlistInfo(null);
        fetchUserBookingsAndWaitlist(); // Refresh user bookings after successful booking
      }

      fetchTableAvailability();
      fetchWaitlist();
    } catch (error) {
      console.error(error);
      setMessage("Booking failed. You may join the waitlist.");
      setWaitlistInfo({ fallback: true });
    }

    setLoading(false);
  };


  const handleJoinWaitlist = async () => {
    if (!timeSlot || !customerName || !partySize || !bookingDate) {
      alert("Please fill all fields to join waitlist.");
      return;
    }

    // 🛑 Check for waitlist conflicts
    const waitlistConflict = checkWaitlistConflict();
    if (waitlistConflict) {
      setMessage(waitlistConflict);
      setWaitlistConflict(waitlistConflict);
      return;
    }

    // 🛑 Check for booking conflicts (can't join waitlist if already booked)
    const bookingConflict = checkBookingConflict();
    if (bookingConflict) {
      setMessage(bookingConflict);
      setBookingConflict(bookingConflict);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const requestedStartTime = parseTimeToDate(bookingDate, timeSlot);
      const requestedEndTime = new Date(requestedStartTime.getTime() + duration * 60000);

      const res = await axiosInstance.post(
        "/waitlist",
        {
          restaurant: restaurantId,
          customerName,
          date: bookingDate,
          requestedStartTime,
          requestedEndTime,
          partySize,
        }
      );

      if (res.data?.estimatedAvailableTime) {
        const baseTime = new Date(res.data.estimatedAvailableTime);
        const bufferedTime = new Date(baseTime.getTime() + BUFFER_MINUTES * 60000);
        setEarliestAvailableTime(bufferedTime);
      }

      setMessage(res.data?.message || "Added to waitlist successfully!");
      setWaitlistInfo(res.data?.waitlistEntry || null);
      setWaitlistConflict(null);
      setBookingConflict(null);
      fetchWaitlist();
      fetchUserBookingsAndWaitlist(); // Refresh user waitlist after joining
    } catch (error) {
      console.error(error);
      setMessage("Failed to join waitlist.");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (openingHour, closingHour, interval = 30) => {
    if (!openingHour || !closingHour) return [];
    const slots = [];
    const [openH, openM] = openingHour.split(":").map(Number);
    const [closeH, closeM] = closingHour.split(":").map(Number);

    let current = new Date();
    current.setHours(openH, openM, 0, 0);

    const close = new Date();
    close.setHours(closeH, closeM, 0, 0);
    if (closeH < openH) close.setDate(close.getDate() + 1);

    while (current < close) {
      slots.push(current.toTimeString().slice(0, 5));
      current = new Date(current.getTime() + interval * 60000);
    }
    return slots;
  };

  if (!restaurant) return <p className="text-slate-300 p-6">Loading...</p>;

  const slots = generateTimeSlots(restaurant.openingHour, restaurant.closingHour);

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-slate-100">{restaurant.name}</h2>
          <p className="text-slate-400">{restaurant.location}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="booking-form bg-slate-800 border border-slate-700 rounded-2xl p-5 text-slate-100">
            <div className="formGroup">
              <label className="label text-black">Your Name:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-slate-900 text-white border border-slate-600 rounded px-3 py-2 w-full" />
            </div>

            <div className="formGroup">
              <label className="label text-black">Select Date:</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="bg-slate-900 text-white border border-slate-600 rounded px-3 py-2 w-full" />
            </div>

            <div className="formGroup">
              <label className="label text-black">Select Time Slot:</label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="bg-slate-900 text-white border border-slate-600 rounded px-3 py-2 w-full">
                <option value="">Select slot</option>
                {slots.map((slot, idx) => (
                  <option key={idx} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label className="label text-black">Party Size:</label>
              <input type="number" min="1" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="bg-slate-900 text-white border border-slate-600 rounded px-3 py-2 w-full" />
            </div>

            <div className="formGroup">
              <label className="label text-black">Duration (minutes):</label>
              <input type="number" min="30" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="bg-slate-900 text-white border border-slate-600 rounded px-3 py-2 w-full" />
            </div>

            <div className="formGroup">
              <label className="label text-black">Pre-order Food (Optional):</label>
              {foodMenu.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMenuCard(!showMenuCard)}
                    style={{ marginBottom: "10px" }}
                    className="text-black"
                  >
                    {showMenuCard ? "Close Menu" : "Open Menu"}
                  </button>

                  {showMenuCard && (
                    <MenuCard
                      foodItems={foodMenu}
                      preOrders={preOrders}
                      onPreOrderChange={handlePreOrderChange}
                      onClose={() => setShowMenuCard(false)}
                    />
                  )}
                </>
              ) : (
                <p>No menu available.</p>
              )}
            </div>

            <button
              id="confirmBtn"
              onClick={handleBooking}
              disabled={loading}
              className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700"
            >
              {loading ? "Processing..." : "Book Table"}
            </button>

            {/* Show conflict messages */}
            {bookingConflict && (
              <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-200 font-semibold text-sm">⚠ Cannot Book: {bookingConflict}</p>
              </div>
            )}

            {waitlistConflict && (
              <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-200 font-semibold text-sm">⚠ Cannot Join Waitlist: {waitlistConflict}</p>
              </div>
            )}

            {message && <p className="message">{message}</p>}
            
            {/* Show waitlist queue after successfully joining */}
            {waitlistInfo && waitlistInfo._id && (
              <div className="mt-4 bg-green-900/30 border border-green-500/50 rounded-xl p-4">
                <p className="text-green-200 font-semibold text-lg mb-3">✓ You've joined the waitlist</p>
                
                <div className="space-y-2 text-black text-sm">
                  <p>
                    <span className="text-black">Your Queue Position:</span>{" "}
                    <strong className="text-green-200">#{waitlistInfo.queuePosition || "N/A"}</strong>
                  </p>
                  
                  {waitlistInfo.estimatedAvailableTime && (
                    <p>
                      <span className="text-black">Estimated Seat Time:</span>{" "}
                      <strong className="text-green-200">
                        {new Date(waitlistInfo.estimatedAvailableTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </strong>
                    </p>
                  )}
                </div>

                {(() => {
                  const peopleAhead = waitlistEntries.filter(
                    (entry) =>
                      entry.status === "waiting" &&
                      entry.partySize === partySize &&
                      entry.queuePosition < (waitlistInfo.queuePosition || Infinity)
                  );

                  if (peopleAhead.length === 0) return null;

                  return (
                    <div className="mt-4 bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-black text-sm font-semibold mb-3">
                        {peopleAhead.length} {peopleAhead.length === 1 ? "person is" : "people are"} ahead of you:
                      </p>
                      <ul className="text-black text-sm space-y-2">
                        {peopleAhead.map((person, idx) => (
                          <li key={person._id || idx} className="ml-2 bg-slate-800/30 p-2 rounded">
                            <span className="font-semibold">#{person.queuePosition}</span> - {person.customerName} (party of {person.partySize})
                            {person.requestedStartTime && (
                              <p className="text-black text-xs mt-1">
                                Requested: {new Date(person.requestedStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Table Occupancy Info for Waitlist */}
                {(() => {
                  const suitableTables = sortedTables.filter((t) => t.capacity >= partySize);
                  
                  const tableOccupancy = suitableTables.map((table) => {
                    const tableBookings = (table.bookings || []).filter((b) => {
                      const bDate = new Date(b.startTime);
                      const sDate = new Date(bookingDate);
                      return (
                        bDate.getFullYear() === sDate.getFullYear() &&
                        bDate.getMonth() === sDate.getMonth() &&
                        bDate.getDate() === sDate.getDate()
                      );
                    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                    return { table, bookings: tableBookings };
                  });

                  return (
                    <div className="mt-4 bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-black text-sm font-semibold mb-3">When Tables Will Be Free:</p>
                      <div className="space-y-2">
                        {tableOccupancy.map(({ table, bookings }, idx) => (
                          <div key={table._id || idx} className="bg-slate-800/30 p-2 rounded text-xs">
                            <p className="text-black font-semibold">
                              Table {table.tableNumber || table.tableId} (capacity: {table.capacity})
                            </p>
                            {bookings.length > 0 ? (
                              <div className="text-black">
                                {bookings.map((booking, bIdx) => (
                                  <p key={bIdx} className="mt-1">
                                    Booked:{" "}
                                    <span className="text-blue-300">
                                      {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    {" "}→{" "}
                                    <span className="text-green-300">
                                      {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-green-300 mt-1">✓ Available all day</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Table Availability Timeline */}
                {(() => {
                  const availableTables = sortedTables.filter((t) => t.capacity >= partySize);

                  return availableTables.length > 0 ? (
                    <div className="mt-4 bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-black text-sm font-semibold mb-3">Table Availability Timeline:</p>
                      <div className="space-y-2">
                        {availableTables.map((table, idx) => {
                          const tableBookings = table.bookings || [];
                          const relevantBookings = tableBookings.filter((b) => {
                            const bookingDate = new Date(b.date || b.startTime);
                            const selectedDate = new Date(bookingDate);
                            const requestedDate = new Date(bookingDate);
                            return bookingDate.toDateString() === requestedDate.toDateString();
                          });

                          let status = "Available now";
                          if (relevantBookings.length > 0) {
                            const lastBooking = relevantBookings[relevantBookings.length - 1];
                            const freeAt = new Date(lastBooking.endTime);
                            status = `Free at ${freeAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                          }

                          return (
                            <div key={table._id || idx} className="bg-slate-800/50 p-2 rounded border border-slate-700 text-xs">
                              <p className="text-black">
                                <strong>Table {table.tableNumber || table.tableId}</strong> (capacity: {table.capacity})
                              </p>
                              <p className="text-black">{status}</p>
                              {relevantBookings.length > 0 && (
                                <p className="text-black text-xs mt-1">
                                  Currently booked until{" "}
                                  {new Date(relevantBookings[relevantBookings.length - 1].endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            
            {loadingAvailability && <p>Checking table availability...</p>}

            {timeSlot && !loadingAvailability && !sortedTables.some(t => !isTableBooked(t) && canAccommodateParty(t)) && (
              <div className="waitlist-section mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <p className="text-black font-semibold mb-3">No available tables at this time.</p>

                {conflictingTables.length > 0 && (
                  <div className="mb-4 bg-slate-900/50 p-3 rounded border border-slate-600">
                    <p className="text-black text-sm font-semibold mb-2">Current Bookings:</p>
                    {conflictingTables.map((table, i) => {
                      const conflictingBookings = table.bookings.filter((b) => {
                        const start = new Date(b.startTime);
                        const end = new Date(b.endTime);
                        const requestedStart = parseTimeToDate(bookingDate, timeSlot);
                        const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);
                        return requestedStart < end && requestedEnd > start;
                      });

                      if (!conflictingBookings.length) return null;

                      const bookingTimes = conflictingBookings
                        .map((b) => {
                          const start = new Date(b.startTime);
                          const end = new Date(b.endTime);
                          return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                        })
                        .join(", ");

                      return (
                        <p key={i} className="text-black text-sm">
                          Table {table.tableNumber || table.tableId}: <strong>{bookingTimes}</strong>
                        </p>
                      );
                    })}
                  </div>
                )}

                {earliestAvailableTime && (
                  <div className="mb-4 bg-blue-900/30 p-3 rounded border border-blue-500/50">
                    <p className="text-black text-sm">If you join the waitlist:</p>
                    <p className="font-semibold text-lg">
                      <span className="text-black">Estimated available time: </span>
                      <strong className="text-blue-200">{new Date(earliestAvailableTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                    </p>
                  </div>
                )}

                {/* Show Tables and Their Availability Before Joining */}
                {(() => {
                  const availableTables = sortedTables.filter((t) => t.capacity >= partySize);

                  return availableTables.length > 0 ? (
                    <div className="mb-4 bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-black text-sm font-semibold mb-3">Tables Available for Your Party Size - Booking Times:</p>
                      <div className="space-y-2">
                        {availableTables.slice(0, 5).map((table, idx) => {
                          const tableBookings = (table.bookings || []).filter((b) => {
                            const bDate = new Date(b.startTime);
                            const sDate = new Date(bookingDate);
                            return (
                              bDate.getFullYear() === sDate.getFullYear() &&
                              bDate.getMonth() === sDate.getMonth() &&
                              bDate.getDate() === sDate.getDate()
                            );
                          }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                          return (
                            <div key={table._id || idx} className="bg-slate-800/30 p-2 rounded text-xs">
                              <p className="text-black font-semibold">
                                Table {table.tableNumber || table.tableId} (capacity: {table.capacity})
                              </p>
                              {tableBookings.length > 0 ? (
                                <div className="text-black mt-1">
                                  {tableBookings.map((booking, bIdx) => (
                                    <p key={bIdx} className="mb-1">
                                      <span className="text-blue-300">
                                        {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                      {" → "}
                                      <span className="text-orange-300">
                                        {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-green-300 text-xs mt-1">✓ Available all day</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {(() => {
                  const otherWaiting = waitlistEntries.filter(
                    (entry) => entry.status === "waiting" && entry.partySize === partySize
                  );
                  return otherWaiting.length > 0 ? (
                    <div className="mb-4 bg-amber-900/30 p-3 rounded border border-amber-500/50">
                      <p className="text-black text-sm">Waitlist Status:</p>
                      <p className="text-black font-semibold">
                        {otherWaiting.length} other {otherWaiting.length === 1 ? "person is" : "people are"} waiting for a table for {partySize} {partySize === 1 ? "person" : "people"}
                      </p>
                      <p className="text-black text-xs mt-2">You'll be next in queue if you join now</p>
                    </div>
                  ) : (
                    <div className="mb-4 bg-green-900/30 p-3 rounded border border-green-500/50">
                      <p className="text-green-200 font-semibold text-sm">You'll be first in the waitlist if you join now</p>
                    </div>
                  );
                })()}

                <button
                  id="waitlistBtn"
                  onClick={handleJoinWaitlist}
                  disabled={loading}
                  className="mt-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800"
                >
                  {loading ? "Processing..." : "Join Waitlist"}
                </button>
              </div>
            )}
          </div>

          <div className="table-layout bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Table Layout</h3>
            <div className="grid">
              {sortedTables.length > 0 ? (
                sortedTables.map((table, index) => {
                  const booked = isTableBooked(table);
                  const isSelected = table.tableId === selectedTableId || table._id === selectedTableId;

                  let classSuffix = "not-allowed";
                  let clickable = false;
                  const cap = table.capacity || 0;

                  const hasExactAvailable = sortedTables.some(
                    (t) => !isTableBooked(t) && t.capacity === partySize
                  );
                  const hasLargerAvailable = sortedTables.some(
                    (t) => !isTableBooked(t) && t.capacity > partySize && t.capacity <= partySize + 1
                  );

                  if (booked) {
                    classSuffix = "unavailable";
                    clickable = false;
                  } else if (cap === partySize && !booked) {
                    classSuffix = isSelected ? "selected" : "available";
                    clickable = true;
                  } else if (!hasExactAvailable && cap > partySize && cap <= partySize + 1 && !booked) {
                    classSuffix = isSelected ? "selected" : "available";
                    clickable = true;
                  } else {
                    classSuffix = "not-allowed";
                    clickable = false;
                  }

                  if (seatsDisabled) {
                    classSuffix = "disabled";
                    clickable = false;
                  }

                  return (
                    <div
                      key={table.tableId || table._id || index}
                      className={`seat ${classSuffix}`}
                      onClick={() => {
                        if (clickable) {
                          setSelectedTableId(isSelected ? null : table.tableId || table._id);
                        }
                      }}
                    >
                      <span className="seat-code">T{table.tableNumber || table.tableId}</span>
                      <p>Capacity: {table.capacity || "-"}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-black">No tables available.</p>
              )}
            </div>

            <div className="legend">
              <span className="available text-black"></span> Available
              <span className="selected text-black"></span> Selected
              <span className="unavailable text-black"></span> Unavailable
            </div>

            {waitlistEntries.length > 0 && (
              <div className="waitlist-queue">
                <h4 className="text-lg font-semibold mb-2">Current Waitlist</h4>
                <ul className="space-y-1">
                  {waitlistEntries.map((entry) => {
                    const formattedTime = new Date(entry.requestedStartTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    let statusColor =
                      entry.status === "confirmed"
                        ? "text-green-600"
                        : entry.status === "waiting"
                          ? "text-orange-500"
                          : entry.status === "cancelled"
                            ? "text-red-500"
                            : "text-gray-500";

                    return (
                      <li key={entry._id} className="text-black">
                        {entry.customerName} — Party of {entry.partySize} —
                        <span className="text-blue-600 font-medium">
                          {" "}Joined waitlist for {formattedTime}
                        </span>{" "}
                        — Status:{" "}
                        <span className={`font-semibold ${statusColor}`}>
                          {entry.status
                            ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1)
                            : "Pending"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
