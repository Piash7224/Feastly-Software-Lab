import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Button } from "@mui/material";
import axiosInstance from "../../api/axiosInstance.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RevenueAnalytics() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axiosInstance.get("/admin/restaurants");
      // Only include approved restaurants for revenue
      const rawList = Array.isArray(data) ? data : (Array.isArray(data.restaurants) ? data.restaurants : []);
      const list = rawList.filter(r => r.status === "approved");
      // For each restaurant fetch preorder revenue
      const withRevenue = await Promise.all(list.map(async (rest) => {
        try {
          const { data: rev } = await axiosInstance.get(`/admin/revenue/${rest._id}/preorders`);
          return { ...rest, revenueSeries: rev };
        } catch {
          return { ...rest, revenueSeries: [] };
        }
      }));
      setRestaurants(withRevenue);
    } catch (err) { setRestaurants([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  if (loading) return <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h4" gutterBottom>Revenue Analytics</Typography>
        <Button size="small" variant="outlined" onClick={fetchRestaurants}>Refresh</Button>
      </Box>
      {restaurants.map((rest) => {
        const chartData = (rest.revenueSeries || []).map(p => ({
          date: p.date,
          revenue: p.revenue || 0,
        }));

        const totalRevenue = chartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

        return (
          <Paper key={rest._id} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">{rest.name}</Typography>
            <Typography>Total Revenue: ${totalRevenue.toFixed(2)}</Typography>
            <Box sx={{ height: 250, mt: 1 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <Typography>No revenue data yet.</Typography>}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
