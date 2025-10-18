import { useState, useEffect } from "react";
import axios from "axios";

export default function TableBooking() {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live update every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchTables(), fetchBookings()]);
    setLoading(false);
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get("/api/tables");
      setTables(res.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/bookings");
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleTableSelect = (tableId) => {
    setSelectedTable(selectedTable === tableId ? null : tableId);
  };

  const handleBooking = async () => {
    if (!selectedTable) return;

    try {
      await axios.post("/api/bookings", {
        tableId: selectedTable,
        people: peopleCount,
      });
      setBookingStatus({ success: true, message: "Booking confirmed!" });
      fetchData();
    } catch (error) {
      setBookingStatus({
        success: false,
        message: error.response?.data?.message || "Booking failed",
      });
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-forest-800 font-medium">
        Loading tables and bookings...
      </div>
    );

  return (
    <main className="min-h-screen p-6 bg-forest-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-forest-800 text-center">
          Table Booking
        </h1>

        {/* Booking Controls */}
        <section className="bg-forest-100 p-6 rounded-lg shadow-lg space-y-6">
          {/* People Count */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="font-semibold text-forest-900">
              Number of People:
            </label>
            <input
              type="number"
              min="1"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
              className="input input-bordered w-24 bg-white"
            />
          </div>

          {/* Table Selection */}
          <div>
            <h2 className="text-lg font-semibold text-forest-800 mb-2">
              Select Table
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table.id)}
                  disabled={!table.available}
                  className={`btn btn-sm border rounded-lg font-semibold transition-colors ${
                    !table.available
                      ? "bg-gray-300 cursor-not-allowed"
                      : selectedTable === table.id
                      ? "bg-forest btn-active text-white"
                      : "bg-forest-content text-forest-900 hover:bg-forest-200"
                  }`}
                >
                  T{table.number}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Button */}
          <button
            onClick={handleBooking}
            disabled={!selectedTable}
            className="btn btn-primary btn-block mt-4"
          >
            Confirm Booking
          </button>

          {/* Booking Status */}
          {bookingStatus && (
            <div
              className={`alert mt-4 ${
                bookingStatus.success ? "alert-success" : "alert-error"
              }`}
            >
              {bookingStatus.message}
            </div>
          )}
        </section>

        {/* Live Booking Status */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-forest-700 mb-4">
            Live Booking Status
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-forest-200 text-forest-900">
                  <th>Booking ID</th>
                  <th>Table Number</th>
                  <th>People</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-forest-800">
                      No bookings yet
                    </td>
                  </tr>
                )}
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.tableNumber}</td>
                    <td>{booking.people}</td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === "confirmed"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
