import React from "react";
import { Container, Typography, Paper } from "@mui/material";

export default function Payment() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Payment
        </Typography>
        <Typography>
          This is a placeholder for the Payment page.
        </Typography>
      </Paper>
    </Container>
  );
}
