import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../Styles/bookingStyles.css";
import "../Styles/menuCard.css";
import MenuCard from "../components/MenuCard";
import { motion, AnimatePresence } from "framer-motion";

// Helper to include Authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

  const BUFFER_MINUTES = 30;

  // ======= Fetch restaurant & food menu =======
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`/api/restaurants/${restaurantId}`, {
          headers: getAuthHeaders(),
        });
        setRestaurant(res.data);

        const foodRes = await axios.get(`/api/foods/restaurant/${restaurantId}`, {
          headers: getAuthHeaders(),
        });
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
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/restaurants/${restaurantId}/availability?date=${bookingDate}`,
        { headers: getAuthHeaders() }
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
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/waitlist?restaurantId=${restaurantId}&date=${bookingDate}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const filtered = res.data.filter((entry) =>
        ["waiting", "booked", "seated"].includes(entry.status)
      );
      setWaitlistEntries(filtered || []);
    } catch (err) {
      console.error(err);
    }
  };

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
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/restaurants/${restaurantId}/availability?date=${bookingDate}`,
        { headers: getAuthHeaders() }
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
    setMessage("");
    setWaitlistInfo(null);
    setEarliestAvailableTime(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/bookings",
        {
          restaurant: restaurantId,
          customerName,
          date: bookingDate,
          timeSlot,
          partySize,
          duration,
          preOrders,
          selectedTableId,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const requestedStartTime = parseTimeToDate(bookingDate, timeSlot);
      const requestedEndTime = new Date(requestedStartTime.getTime() + duration * 60000);

      const res = await axios.post(
        "/api/waitlist",
        {
          restaurant: restaurantId,
          customerName,
          date: bookingDate,
          requestedStartTime,
          requestedEndTime,
          partySize,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.data?.estimatedAvailableTime) {
        const baseTime = new Date(res.data.estimatedAvailableTime);
        const bufferedTime = new Date(baseTime.getTime() + BUFFER_MINUTES * 60000);
        setEarliestAvailableTime(bufferedTime);
      }

      setMessage(res.data?.message || "Added to waitlist successfully!");
      setWaitlistInfo(res.data?.waitlistEntry || null);
      fetchWaitlist();
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
          <div className="booking-form bg-blue-50 border border-blue-200 rounded-2xl p-5 text-gray-900">
            <div className="formGroup">
              <label className="label">Your Name:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>

            <div className="formGroup">
              <label className="label">Select Date:</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
            </div>

            <div className="formGroup">
              <label className="label">Select Time Slot:</label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="">Select slot</option>
                {slots.map((slot, idx) => (
                  <option key={idx} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label className="label">Party Size:</label>
              <input type="number" min="1" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} />
            </div>

            <div className="formGroup">
              <label className="label">Duration (minutes):</label>
              <input type="number" min="30" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>

            <div className="formGroup">
              <label className="label">Pre-order Food (Optional):</label>
              {foodMenu.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMenuCard(!showMenuCard)}
                    style={{ marginBottom: "10px" }}
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

            {message && <p className="message">{message}</p>}
            {loadingAvailability && <p>Checking table availability...</p>}

            {timeSlot && !loadingAvailability && !sortedTables.some(t => !isTableBooked(t) && canAccommodateParty(t)) && (
              <div className="waitlist-section mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <p>No available tables at this time.</p>

                {conflictingTables.length > 0 &&
                  conflictingTables.map((table, i) => {
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
                      <p key={i}>
                        Table {table.tableNumber || table.tableId} is booked from: <strong>{bookingTimes}</strong>
                      </p>
                    );
                  })}

                {earliestAvailableTime && (
                  <p>
                    Earliest available time:{" "}
                    <strong>
                      {new Date(earliestAvailableTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </strong>
                  </p>
                )}

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
                <p className="text-slate-300">No tables available.</p>
              )}
            </div>

            <div className="legend">
              <span className="available"></span> Available
              <span className="selected"></span> Selected
              <span className="unavailable"></span> Unavailable
            </div>

            {waitlistEntries.length > 0 && (
              <div className="waitlist-queue">
                <h4>Current Waitlist</h4>
                <ul>
                  {waitlistEntries.map((entry) => (
                    <li key={entry._id}>
                      {entry.customerName} — Party of {entry.partySize} — Requested:{" "}
                      {new Date(entry.requestedStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — Status:{" "}
                      <span className={`status ${entry.status || "pending"}`}>
                        {entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
