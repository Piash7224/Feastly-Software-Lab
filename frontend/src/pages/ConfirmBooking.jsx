import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

export default function ConfirmBooking() {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [table, setTable] = useState(null);
  const [bookingDate, setBookingDate] = useState(dayjs());
  const [bookingTime, setBookingTime] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const resRestaurant = await fetch(
        `/api/restaurants/${restaurantId}`
      );
      const restaurantData = await resRestaurant.json();

      const resTable = await fetch(
        `/api/tables/${tableId}`
      );
      const tableData = await resTable.json();

      setRestaurant(restaurantData);
      setTable(tableData);
    } catch (error) {
      toast.error("Failed to load booking details");
    }
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!bookingTime || !bookingDate) {
      toast.error("Please select date and time");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: restaurantId,
          tableId: tableId,
          customerName: "John Doe", // replace with actual user
          date: bookingDate.format("YYYY-MM-DD"),
          timeSlot: bookingTime,
          partySize,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Booking confirmed!");
        navigate("/explore");
      } else if (data.waitlistEntry) {
        toast(
          "Table is already booked. You have been added to the waitlist.",
          { icon: "⏳" }
        );
        navigate("/explore");
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (error) {
      toast.error("Error creating booking");
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography mt={2}>Loading booking details...</Typography>
      </Box>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Confirm Booking
      </Typography>

      <Typography variant="h6">{restaurant.name}</Typography>
      <Typography variant="body2">{restaurant.location}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        T{table.number} ({table.capacity} seats)
      </Typography>

      <Box sx={{ mt: 3 }}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={bookingDate.format("YYYY-MM-DD")}
          onChange={(e) => setBookingDate(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Time Slot"
          fullWidth
          value={bookingTime}
          onChange={(e) => setBookingTime(e.target.value)}
          sx={{ mb: 2 }}
        >
          {restaurant.timeSlots?.map((slot) => (
            <MenuItem key={slot} value={slot}>
              {slot}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Party Size"
          type="number"
          fullWidth
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{ min: 1 }}
        />

        <Button variant="contained" fullWidth onClick={handleBooking}>
          Confirm Booking
        </Button>
      </Box>
    </Container>
  );
}
