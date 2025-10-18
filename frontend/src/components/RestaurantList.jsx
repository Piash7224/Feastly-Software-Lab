import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/restaurants");
      setRestaurants(res.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

    try {
      await axios.delete(`/api/restaurants/${id}`);
      setRestaurants(restaurants.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      alert("Failed to delete restaurant");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
      <button
        className="btn btn-primary mb-4"
        onClick={() => navigate("/restaurants/add")}
      >
        Add New Restaurant
      </button>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Cuisine</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r) => (
            <tr key={r._id} className="border-t">
              <td>{r.name}</td>
              <td>{r.location}</td>
              <td>{r.cuisine}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning mr-2"
                  onClick={() => navigate(`/restaurants/edit/${r._id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(r._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
