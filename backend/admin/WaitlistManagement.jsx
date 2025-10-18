import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Grid, Button, TextField, Alert } from "@mui/material";
import axios from "axios";

export default function WaitlistManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [waitlistByRestaurant, setWaitlistByRestaurant] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRestaurants = async () => {
    const { data } = await axios.get("/api/admin/restaurants", config);
    return Array.isArray(data) ? data : (Array.isArray(data.restaurants) ? data.restaurants : []);
  };

  const fetchWaitlist = async (restaurantId) => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : "";
    const { data } = await axios.get(`/api/admin/waitlist/${restaurantId}${qs}`, config);
    return Array.isArray(data) ? data : [];
  };

  const updateWaitlistStatus = async (id, status) => {
    await axios.put(`/api/admin/waitlist/${id}/status`, { status }, config);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchRestaurants();
        setRestaurants(list);
        const entries = await Promise.all(list.map(r => fetchWaitlist(r._id)));
        const map = {};
        list.forEach((r, idx) => { map[r._id] = entries[idx]; });
        setWaitlistByRestaurant(map);
        setError("");
      } catch (e) {
        setRestaurants([]);
        setWaitlistByRestaurant({});
        setError("Failed to load waitlist");
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  const handleCancel = async (entryId, restaurantId) => {
    try {
      await updateWaitlistStatus(entryId, "cancelled");
      const updated = await fetchWaitlist(restaurantId);
      setWaitlistByRestaurant(prev => ({ ...prev, [restaurantId]: updated }));
    } catch {}
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Waitlist Management</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField size="small" type="date" label="Filter by Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
        <Button size="small" variant="outlined" onClick={() => setDate("")}>Clear</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {restaurants.map(rest => (
        <Paper key={rest._id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{rest.name}</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {(waitlistByRestaurant[rest._id] || []).map(w => (
              <Grid xs={12} md={6} key={w._id}>
                <Paper sx={{ p: 2 }}>
                  <Typography>{w.customerName}</Typography>
                  <Typography>Date: {new Date(w.date).toLocaleDateString()}</Typography>
                  <Typography>Status: {w.status}</Typography>
                  {w.status !== "cancelled" && (
                    <Button size="small" color="error" sx={{ mt: 1 }} onClick={() => handleCancel(w._id, rest._id)}>Cancel</Button>
                  )}
                </Paper>
              </Grid>
            ))}
            {(!waitlistByRestaurant[rest._id] || waitlistByRestaurant[rest._id].length === 0) && (
              <Grid xs={12}>
                <Typography color="text.secondary" sx={{ p: 2 }}>No waitlist entries for this selection.</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
}


