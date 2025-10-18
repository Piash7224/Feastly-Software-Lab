import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Grid } from "@mui/material";
import axios from "axios";

export default function UserOwnerManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/admin/users", config);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (id, isBlocked) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`/api/admin/users/${id}/status`, { isBlocked: !isBlocked }, config);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>User / Owner Management</Typography>
      <Grid container spacing={3}>
        {users.map(u => (
          <Grid xs={12} md={6} lg={4} key={u._id}>
            <Paper sx={{ p: 2 }}>
              <Typography>{u.name} ({u.role})</Typography>
              <Typography>Email: {u.email}</Typography>
              <Typography>Status: {u.isBlocked ? "Blocked" : "Active"}</Typography>
              <Button size="small" variant="contained" color={u.isBlocked ? "success" : "error"} sx={{ mt: 1 }} onClick={() => toggleBlock(u._id, u.isBlocked)}>
                {u.isBlocked ? "Allow" : "Block"}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
