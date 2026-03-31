import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Grid, Card, CardMedia, CardContent, Box, TextField, MenuItem, CircularProgress } from "@mui/material";
import axiosInstance from "../api/axiosInstance.js";

export default function Food() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRestaurants = async () => {
    try {
      const { data } = await axiosInstance.get("/restaurants");
      // Support both array and {restaurants: []}
      const list = Array.isArray(data) ? data : (Array.isArray(data.restaurants) ? data.restaurants : []);
      setRestaurants(list.filter(r => r.status === "approved" || !r.status));
      if (list.length > 0 && !selected) setSelected(list[0]._id);
    } catch {
      setRestaurants([]);
    }
  };

  const loadFoods = async (restaurantId) => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/foods/restaurant/${restaurantId}`);
      setFoods(Array.isArray(data) ? data : []);
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRestaurants(); }, []);
  useEffect(() => { if (selected) loadFoods(selected); }, [selected]);

  const current = restaurants.find(r => r._id === selected);

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Menu</Typography>
        <TextField size="small" select value={selected} onChange={(e) => setSelected(e.target.value)} sx={{ minWidth: 240 }}>
          {restaurants.map(r => (
            <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {current && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">{current.name}</Typography>
          <Typography color="text.secondary">{current.location} · {current.cuisine}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : foods.length === 0 ? (
        <Typography color="text.secondary">No menu items available.</Typography>
      ) : (
        <Grid container spacing={3}>
          {foods.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia component="img" height="160" image={item.image || "/uploads/default.png"} alt={item.name} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography color="text.secondary" sx={{ my: 0.5 }}>{item.description || ""}</Typography>
                  <Typography fontWeight={600}>${Number(item.price || 0).toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
