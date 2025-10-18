import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function RestaurantManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const qs = status && status !== "all" ? `?status=${status}` : "";
      const { data } = await axios.get(`/api/admin/restaurants${qs}`, config);
      setRestaurants(
        Array.isArray(data) ? data : Array.isArray(data.restaurants) ? data.restaurants : []
      );
      setError("");
    } catch (err) {
      setRestaurants([]);
      setError("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [status]);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`/api/admin/restaurants/${id}`, { action }, config);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Restaurant Management
      </Typography>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={status}
          onChange={(e, v) => v && setStatus(v)}
        >
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="approved">Approved</ToggleButton>
          <ToggleButton value="rejected">Rejected</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
        <Button size="small" variant="outlined" onClick={fetchRestaurants}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {restaurants.map((rest) => (
          <Grid xs={12} md={6} lg={4} key={rest._id}>
            <Paper sx={{ p: 2 }}>
              {/* ✅ Restaurant Image */}
              {rest.image ? (
                <Box sx={{ mb: 1, textAlign: "center" }}>
                  <img
                    src={`http://localhost:5001${rest.image}`} // prepend backend base URL if needed
                    alt={rest.name || "Restaurant Image"}
                    style={{
                      width: "100%",
                      maxHeight: 150,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    mb: 1,
                    textAlign: "center",
                    height: 150,
                    bgcolor: "#f0f0f0",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Image
                  </Typography>
                </Box>
              )}

              <Typography variant="h6">{rest.name}</Typography>
              <Typography>Location: {rest.location}</Typography>
              <Typography>Cuisine: {rest.cuisine}</Typography>
              <Typography>Status: {rest.status}</Typography>

              <Box mt={1}>
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

      {!restaurants.length && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography color="text.secondary">
            No restaurants found for the selected filter.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
