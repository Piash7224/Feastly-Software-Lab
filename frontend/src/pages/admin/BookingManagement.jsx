import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Grid, Button, TextField, Alert } from "@mui/material";
import axios from "axios";

export default function BookingManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [bookingsByRestaurant, setBookingsByRestaurant] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRestaurants = async () => {
    const { data } = await axios.get("/api/admin/restaurants", config);
    return Array.isArray(data) ? data : (Array.isArray(data.restaurants) ? data.restaurants : []);
  };

  const fetchBookings = async (restaurantId) => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : "";
    const { data } = await axios.get(`/api/admin/bookings/${restaurantId}${qs}`, config);
    return Array.isArray(data) ? data : [];
  };

  const updateBookingStatus = async (id, status) => {
    await axios.put(`/api/admin/bookings/${id}/status`, { status }, config);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchRestaurants();
        setRestaurants(list);
        const entries = await Promise.all(list.map(r => fetchBookings(r._id)));
        const map = {};
        list.forEach((r, idx) => { map[r._id] = entries[idx]; });
        setBookingsByRestaurant(map);
        setError("");
      } catch (e) {
        setRestaurants([]);
        setBookingsByRestaurant({});
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  const handleCancel = async (bookingId, restaurantId) => {
    try {
      await updateBookingStatus(bookingId, "cancelled");
      const updated = await fetchBookings(restaurantId);
      setBookingsByRestaurant(prev => ({ ...prev, [restaurantId]: updated }));
    } catch {}
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Booking Management</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField size="small" type="date" label="Filter by Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
        <Button size="small" variant="outlined" onClick={() => setDate("")}>Clear</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {restaurants.map(rest => (
        <Paper key={rest._id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{rest.name}</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {(bookingsByRestaurant[rest._id] || []).map(b => (
              <Grid xs={12} md={6} key={b._id}>
                <Paper sx={{ p: 2 }}>
                  <Typography>{b.customerName}</Typography>
                  <Typography>Date: {b.date ? new Date(b.date).toLocaleDateString() : "-"}</Typography>
                  <Typography>Time: {new Date(b.startTime).toLocaleTimeString()} - {new Date(b.endTime).toLocaleTimeString()}</Typography>
                  <Typography>Status: {b.status || "pending"}</Typography>
                  {b.status !== "cancelled" && (
                    <Button size="small" color="error" sx={{ mt: 1 }} onClick={() => handleCancel(b._id, rest._id)}>Cancel</Button>
                  )}
                </Paper>
              </Grid>
            ))}
            {(!bookingsByRestaurant[rest._id] || bookingsByRestaurant[rest._id].length === 0) && (
              <Grid xs={12}>
                <Typography color="text.secondary" sx={{ p: 2 }}>No bookings for this selection.</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
}


