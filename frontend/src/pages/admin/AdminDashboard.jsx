import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Grid, Alert } from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import axiosInstance from "../../api/axiosInstance.js";

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [error, setError] = useState("");

  // Fetch latest pending restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data: restaurantsArray } = await axiosInstance.get("/admin/restaurants?status=pending&limit=6");
      const { data: daily } = await axiosInstance.get("/admin/revenue/global/daily");
      const { data: monthly } = await axiosInstance.get("/admin/revenue/global/monthly");

      const statsPromises = restaurantsArray.map(async (rest) => ({ ...rest }));
      const restaurantsWithStats = await Promise.all(statsPromises);
      setRestaurants(restaurantsWithStats);
      setDailyRevenue(daily);
      setMonthlyRevenue(monthly);
      setError("");
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setRestaurants([]);
      setDailyRevenue([]);
      setMonthlyRevenue([]);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject/delete restaurant
  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axiosInstance.patch(`/admin/restaurants/${id}`, { action });
      fetchRestaurants();
    } catch (err) {
      console.error(`Failed to ${action} restaurant`, err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  const noPending = restaurants.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" fontSize={14}>Today Revenue</Typography>
            <Typography variant="h5" fontWeight={700}>
              ${Number(dailyRevenue.filter(d => d.date === new Date().toISOString().slice(0,10)).reduce((a,c)=>a+(c.revenue||0),0)).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" fontSize={14}>This Month Revenue</Typography>
            <Typography variant="h5" fontWeight={700}>
              ${Number(monthlyRevenue.reduce((a,c)=>a+(c.revenue||0),0)).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <Typography color="text.secondary" fontSize={14}>Pending Requests</Typography>
              <Typography variant="h5" fontWeight={700}>{restaurants.length}</Typography>
            </div>
            <Button size="small" variant="outlined" onClick={fetchRestaurants}>Refresh</Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Global Revenue Charts */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6">Daily Revenue (All Restaurants)</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6">Monthly Revenue (All Restaurants)</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2e7d32" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {noPending && (
          <Grid xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography>No pending restaurant requests.</Typography>
            </Paper>
          </Grid>
        )}
        {restaurants.map((rest) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={rest._id}>
            <Paper sx={{ p: 2 }}>
              {/* Restaurant Image */}
              {rest.imageUrl ? (
                <Box sx={{ mb: 1, textAlign: "center" }}>
                  <img
                    src={rest.imageUrl}
                    alt={rest.name || "Restaurant Image"}
                    style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 4 }}
                  />
                </Box>
              ) : (
                <Box sx={{ mb: 1, textAlign: "center", height: 150, bgcolor: "#f0f0f0", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">No Image</Typography>
                </Box>
              )}

              <Typography variant="h6">{rest.name || "Unnamed Restaurant"}</Typography>
              <Typography variant="body2">{rest.address || "No address available"}</Typography>
              <Typography variant="body2">Owner: {rest.ownerName || (rest.owner?.name ?? "N/A")}</Typography>
              <Typography variant="body2">Status: {rest.status || "pending"}</Typography>

              <Box mt={1}>
                <Typography>Created: {new Date(rest.createdAt).toLocaleString()}</Typography>
                <Typography>Owner: {rest.owner?.name ?? "N/A"} ({rest.owner?.email ?? ""})</Typography>
              </Box>

              <Box mt={2}>
                {rest.status === "pending" && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleAction(rest._id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                      onClick={() => handleAction(rest._id, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  size="small"
                  color="secondary"
                  sx={{ ml: 1 }}
                  onClick={() => handleAction(rest._id, "delete")}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
