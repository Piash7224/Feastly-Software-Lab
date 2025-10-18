import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RestaurantForm from "../components/RestaurantForm";

export default function EditRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        alert("Failed to load restaurant");
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleUpdateRestaurant = async (formData) => {
    try {
      const res = await axios.put(
        `/api/restaurants/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Restaurant updated:", res.data);
      alert("Restaurant updated successfully!");
      navigate("/restaurants");
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("Failed to update restaurant");
    }
  };

  return restaurant ? (
    <RestaurantForm onSubmit={handleUpdateRestaurant} editingRestaurant={restaurant} />
  ) : (
    <p>Loading restaurant data...</p>
  );
}
