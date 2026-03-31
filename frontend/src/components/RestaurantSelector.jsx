import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";

export default function RestaurantSelector({ onSelect }) {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axiosInstance.get("/restaurants");
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="mb-4">
      <label className="mr-2 font-medium">Select Restaurant:</label>
      <select onChange={e => onSelect(e.target.value)} className="border p-1 rounded">
        <option value="">-- Choose --</option>
        {restaurants.map(r => (
          <option key={r._id} value={r._id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
