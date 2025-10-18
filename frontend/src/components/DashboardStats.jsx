import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardStats({ restaurantId }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    waiting: 0,
    booked: 0,
    seated: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // Fetch bookings and waitlist
        const [bookingsRes, waitlistRes] = await Promise.all([
          axios.get(`/api/bookings?restaurantId=${restaurantId}`, config),
          axios.get(`/api/waitlist?restaurantId=${restaurantId}`, config),
        ]);

        const bookings = bookingsRes.data || [];
        const waitlist = waitlistRes.data || [];

        const statObj = {
          totalBookings: bookings.length,
          waiting: waitlist.filter((w) => w.status === "waiting").length,
          booked: waitlist.filter((w) => w.status === "booked").length,
          seated: waitlist.filter((w) => w.status === "seated").length,
          completed: waitlist.filter((w) => w.status === "completed").length,
        };

        setStats(statObj);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [restaurantId]);

  if (loading) {
    return <div className="text-center p-4">Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      <div className="p-4 bg-blue-100 rounded text-center">
        Total Bookings: {stats.totalBookings}
      </div>
      <div className="p-4 bg-yellow-100 rounded text-center">
        Waiting: {stats.waiting}
      </div>
      <div className="p-4 bg-purple-100 rounded text-center">
        Booked: {stats.booked}
      </div>
      <div className="p-4 bg-green-100 rounded text-center">
        Seated: {stats.seated}
      </div>
      <div className="p-4 bg-gray-200 rounded text-center">
        Completed: {stats.completed}
      </div>
    </div>
  );
}
