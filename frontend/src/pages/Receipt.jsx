import React from "react";
import { Container, Typography, Paper } from "@mui/material";

export default function Receipt() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Receipt
        </Typography>
        <Typography>
          This is a placeholder for the Receipt page.
        </Typography>
      </Paper>
    </Container>
  );
}












