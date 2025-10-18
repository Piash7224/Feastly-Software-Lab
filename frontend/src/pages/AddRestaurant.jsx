import React from "react";
import { useNavigate } from "react-router-dom";
import RestaurantForm from "../components/RestaurantForm";
import axios from "axios";

export default function AddRestaurant() {
  const navigate = useNavigate();

  // Handle restaurant creation
  const handleAddRestaurant = async (formData) => {
    try {
      const token = localStorage.getItem("token"); // get token

      if (!token) {
        alert("❌ You are not authorized. Please login first.");
        return;
      }

      const res = await axios.post(
        "http://localhost:5001/api/restaurants",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // attach token here
          },
        }
      );

      console.log("✅ Restaurant created:", res.data);
      alert("✅ Restaurant created successfully!");
      navigate("/restaurants");
    } catch (error) {
      console.error("❌ Error creating restaurant:", error);
      const message =
        error.response?.data?.message ||
        "Failed to create restaurant. Please try again.";
      alert(message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{ background: "#d1d3d8" }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <div className="flex flex-col items-center mb-6">
          <span className="text-3xl mb-2" style={{ fontWeight: 900 }}>
            <span style={{ fontSize: "2rem", marginRight: "8px" }}>➕</span>{" "}
            Add Restaurant
          </span>
        </div>
        <RestaurantForm onSubmit={handleAddRestaurant} />
      </div>
    </div>
  );
}
