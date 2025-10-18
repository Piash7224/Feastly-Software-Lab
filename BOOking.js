import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Booking() {
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [timeSlot, setTimeSlot] = useState("");
    const [partySize, setPartySize] = useState(1);
    const [customerName, setCustomerName] = useState("");
    const [message, setMessage] = useState("");
    const [waitlistInfo, setWaitlistInfo] = useState(null);
    const [bookingDate, setBookingDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [duration, setDuration] = useState(120);
    const [loading, setLoading] = useState(false);
    const [tableAvailability, setTableAvailability] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5001/api/restaurants/${restaurantId}`
                );
                setRestaurant(res.data);
            } catch (err) {
                console.error(err);
                setMessage("Failed to load restaurant data.");
            }
        };
        fetchRestaurant();
    }, [restaurantId]);

    useEffect(() => {
        if (bookingDate && restaurantId) fetchTableAvailability();
    }, [bookingDate, restaurantId, timeSlot]);

    const fetchTableAvailability = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5001/api/bookings/restaurant/${restaurantId}?date=${bookingDate}`
            );
            setTableAvailability(res.data?.tables || []);
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch table availability.");
            setTableAvailability([]);
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

        while (current < close) {
            slots.push(current.toTimeString().slice(0, 5));
            current = new Date(current.getTime() + interval * 60000);
        }
        return slots;
    };

    const parseTimeToDate = (date, timeStr) => {
        const [hh, mm] = timeStr.split(":").map(Number);
        const d = new Date(date);
        d.setHours(hh, mm || 0, 0, 0);
        return d;
    };

    const isTableBooked = (table) => {
        if (!timeSlot) return false;
        const selectedTime = parseTimeToDate(new Date(bookingDate), timeSlot);
        return table.bookings?.some((b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return selectedTime >= start && selectedTime < end;
        });
    };

    const getBookingEndTime = (table) => {
        const booking = table.bookings?.find((b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            const selectedTime = parseTimeToDate(new Date(bookingDate), timeSlot);
            return selectedTime >= start && selectedTime < end;
        });
        return booking ? new Date(booking.endTime).toLocaleTimeString() : "";
    };

    const canAccommodateParty = (table) => {
        const capacity = table.capacity || 0;
        const size = parseInt(partySize, 10);
        return capacity >= size && capacity <= size + 1;
    };

    const handleBooking = async () => {
        if (!timeSlot || !customerName || !partySize || !bookingDate || !selectedTableId) {
            alert("Please fill all fields and select a table.");
            return;
        }
        setMessage("");
        setWaitlistInfo(null);
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5001/api/bookings", {
                restaurant: restaurantId,
                customerName,
                date: bookingDate,
                timeSlot,
                partySize,
                duration,
                tableId: selectedTableId,
            });

            if (res.data.waitlistOption) {
                setWaitlistInfo(res.data);
                setMessage(res.data.message || "No available tables, showing waitlist.");
            } else {
                setMessage(res.data.message || "Booking confirmed!");
            }
            fetchTableAvailability();
        } catch (error) {
            console.error(error);
            setMessage("Booking failed.");
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
            await axios.post("http://localhost:5001/api/waitlist", {
                restaurant: restaurantId,
                customerName,
                date: bookingDate,
                requestedStartTime: timeSlot,
                requestedEndTime: timeSlot,
                partySize,
            });
            setMessage("Added to waitlist successfully!");
            setWaitlistInfo(null);
        } catch (error) {
            console.error(error);
            setMessage("Failed to join waitlist.");
        } finally {
            setLoading(false);
        }
    };

    if (!restaurant) return <p>Loading...</p>;

    const slots = generateTimeSlots(restaurant.openingHour, restaurant.closingHour);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-indigo-600">{restaurant.name} - Book Table</h2>
                <p className="text-gray-600">{restaurant.location}</p>
            </div>

            {/* Booking Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium">Your Name:</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="input input-bordered w-full max-w-xs border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Select Date:</label>
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="input input-bordered w-full max-w-xs border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Select Time Slot:</label>
                        <select
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="select select-bordered w-full max-w-xs border rounded p-2"
                        >
                            <option value="">Select slot</option>
                            {slots.map((slot, idx) => (
                                <option key={idx} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">Party Size:</label>
                        <input
                            type="number"
                            min="1"
                            value={partySize}
                            onChange={(e) => setPartySize(e.target.value)}
                            className="input input-bordered w-full max-w-xs border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Duration (minutes):</label>
                        <input
                            type="number"
                            min="30"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="input input-bordered w-full max-w-xs border rounded p-2"
                        />
                    </div>

                    <div>
                        <button
                            className={`btn btn-primary w-full py-2 px-4 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={handleBooking}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Book Table"}
                        </button>
                    </div>

                    {message && <p className="mt-2 text-green-600 font-medium">{message}</p>}
                </div>

                {/* Table Layout */}
                <div>
                    <h3 className="text-2xl font-semibold mb-4">Table Layout</h3>
                    <div className="grid grid-cols-5 gap-3">
                        {tableAvailability.length > 0 ? (
                            tableAvailability.map((table, index) => {
                                const booked = isTableBooked(table);
                                const canAccommodate = canAccommodateParty(table);
                                const isSelected =
                                    table.tableId === selectedTableId || table._id === selectedTableId;
                                const bookingEndTime = getBookingEndTime(table);

                                return (
                                    <div
                                        key={table.tableId || table._id || index}
                                        className={`relative p-3 border rounded-full cursor-pointer text-center text-sm transition-all shadow ${booked
                                                ? "bg-red-200"
                                                : isSelected
                                                    ? "bg-yellow-200 border-2 border-yellow-500"
                                                    : canAccommodate
                                                        ? "bg-green-200"
                                                        : "bg-gray-300"
                                            }`}
                                        style={{ minHeight: "80px", borderRadius: "12px" }}
                                        onClick={() =>
                                            !booked && canAccommodate && setSelectedTableId(table.tableId || table._id)
                                        }
                                    >
                                        <p className="font-bold">Table #{table.tableNumber || table.tableId}</p>
                                        <p>Capacity: {table.capacity || "-"}</p>
                                        {!booked && (
                                            <p className="text-xs font-medium">
                                                {isSelected ? "Selected" : canAccommodate ? "Available" : "Too Small"}
                                            </p>
                                        )}
                                        {booked && bookingEndTime && (
                                            <div className="group relative">
                                                <p className="text-sm text-red-700">Booked</p>
                                                <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                                                    Booked until {bookingEndTime}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No tables available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
