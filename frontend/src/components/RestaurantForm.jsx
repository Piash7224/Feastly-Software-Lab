import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import TableLayoutEditor from "../components/TableLayoutEditor";

export default function RestaurantForm({ onSubmit, editingRestaurant }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [openingHour, setOpeningHour] = useState("");
  const [closingHour, setClosingHour] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tables, setTables] = useState([]);
  const [foods, setFoods] = useState([
    { name: "", description: "", category: "", price: "", imageFile: null, imagePreview: null },
  ]);

  useEffect(() => {
    if (editingRestaurant) {
      setName(editingRestaurant.name || "");
      setLocation(editingRestaurant.location || "");
      setCuisine(editingRestaurant.cuisine || "");
      setOpeningHour(editingRestaurant.openingHour || "");
      setClosingHour(editingRestaurant.closingHour || "");
      setImage(null);
      setImagePreview(editingRestaurant.image || null);
      setTables(editingRestaurant.tables || []);
      setFoods(
        editingRestaurant.foods?.length > 0
          ? editingRestaurant.foods.map((f) => ({
              ...f,
              imageFile: null,
              imagePreview: f.image,
            }))
          : [{ name: "", description: "", category: "", price: "", imageFile: null, imagePreview: null }]
      );
    } else {
      resetForm();
    }
  }, [editingRestaurant]);

  const resetForm = () => {
    setName("");
    setLocation("");
    setCuisine("");
    setOpeningHour("");
    setClosingHour("");
    setImage(null);
    setImagePreview(null);
    setTables([]);
    setFoods([{ name: "", description: "", category: "", price: "", imageFile: null, imagePreview: null }]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFoodChange = (index, field, value) => {
    const updatedFoods = [...foods];
    updatedFoods[index][field] = value;
    setFoods(updatedFoods);
  };

  const handleFoodImageChange = (index, file) => {
    const updatedFoods = [...foods];
    updatedFoods[index].imageFile = file;
    updatedFoods[index].imagePreview = URL.createObjectURL(file);
    setFoods(updatedFoods);
  };

  const addFoodItem = () => {
    setFoods([
      ...foods,
      { name: "", description: "", category: "", price: "", imageFile: null, imagePreview: null },
    ]);
  };

  const removeFoodItem = (index) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const validateFields = () => {
    const nameRegex = /^[A-Za-z0-9\s'&.-]{3,50}$/;
    const locationRegex = /^[A-Za-z0-9\s,.-]{3,100}$/;
    const cuisineRegex = /^[A-Za-z\s,.-]{2,50}$/;
    const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/;

    if (!nameRegex.test(name.trim())) {
      alert("Please enter a valid restaurant name (3–50 characters, letters/numbers only).");
      return false;
    }
    if (!locationRegex.test(location.trim())) {
      alert("Please enter a valid location (3–100 characters).");
      return false;
    }
    if (cuisine && !cuisineRegex.test(cuisine.trim())) {
      alert("Cuisine must only contain letters, commas, and spaces.");
      return false;
    }
    if (!openingHour || !closingHour) {
      alert("Please enter valid opening and closing hours.");
      return false;
    }

    const validFoods = foods.filter((f) => f.name.trim() && f.price);
    if (validFoods.length === 0) {
      alert("Please add at least one valid food item.");
      return false;
    }

    for (let f of validFoods) {
      if (!/^[A-Za-z0-9\s'&.-]{2,50}$/.test(f.name.trim())) {
        alert("Invalid food name. Use 2–50 characters (letters/numbers only).");
        return false;
      }
      if (f.category && !/^[A-Za-z\s,.-]{2,30}$/.test(f.category.trim())) {
        alert("Invalid food category. Use 2–30 alphabetic characters.");
        return false;
      }
      if (!priceRegex.test(f.price)) {
        alert("Invalid price format. Use numbers only (e.g., 120 or 120.50).");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const cleanedTables = tables.map((table, idx) => ({
      tableNumber: Number(table.tableNumber) || idx + 1,
      capacity: Number(table.capacity) || 4,
      position: table.position || { x: 0, y: 0 },
      shape: table.shape || "circle",
      size: {
        width: Number(table.size?.width) || 50,
        height: Number(table.size?.height) || 50,
      },
    }));

    const validFoods = foods.filter((f) => f.name.trim() && f.price);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("location", location.trim());
    formData.append("cuisine", cuisine.trim() || "Not specified");
    formData.append("openingHour", openingHour);
    formData.append("closingHour", closingHour);
    formData.append("tables", JSON.stringify(cleanedTables));

    // Append restaurant image
    if (image) formData.append("restaurantImage", image);

    // Prepare food data for backend
    const foodsData = validFoods.map((f) => ({
      name: f.name,
      description: f.description,
      category: f.category,
      price: f.price,
      image: f.imageFile ? "" : f.imagePreview || "/uploads/default.png",
    }));
    formData.append("foods", JSON.stringify(foodsData));

    // Append actual food image files
    validFoods.forEach((food) => {
      if (food.imageFile) {
        formData.append("foodImages", food.imageFile);
      }
    });

    onSubmit(formData);

    if (!editingRestaurant) resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      {/* Restaurant Details */}
      <div>
        <label className="block font-semibold text-black">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="input input-bordered w-full text-black"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-black">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={100}
          className="input input-bordered w-full text-black"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-black">Cuisine</label>
        <input
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          maxLength={50}
          className="input input-bordered w-full text-black"
        />
      </div>

      <div>
        <label className="block font-semibold text-black">Opening Hour</label>
        <input
          type="time"
          value={openingHour}
          onChange={(e) => setOpeningHour(e.target.value)}
          className="input input-bordered w-full text-black"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-black">Closing Hour</label>
        <input
          type="time"
          value={closingHour}
          onChange={(e) => setClosingHour(e.target.value)}
          className="input input-bordered w-full text-black"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-black">Restaurant Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input file-input-bordered w-full text-black"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
        )}
      </div>

      {/* Tables Layout */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h6">Tables Layout</Typography>
        <TableLayoutEditor tables={tables} setTables={setTables} />
      </Box>

      {/* Food Menu */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h6">Menu Items</Typography>
        {foods.map((food, idx) => (
          <div key={idx} className="space-y-2 border p-2 rounded">
            <input
              type="text"
              placeholder="Food Name"
              value={food.name}
              onChange={(e) => handleFoodChange(idx, "name", e.target.value)}
              maxLength={50}
              className="input input-bordered w-full text-black"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={food.description}
              onChange={(e) => handleFoodChange(idx, "description", e.target.value)}
              maxLength={150}
              className="input input-bordered w-full text-black"
            />
            <input
              type="text"
              placeholder="Category"
              value={food.category}
              onChange={(e) => handleFoodChange(idx, "category", e.target.value)}
              maxLength={30}
              className="input input-bordered w-full text-black"
            />
            <input
              type="number"
              placeholder="Price"
              value={food.price}
              onChange={(e) => handleFoodChange(idx, "price", e.target.value)}
              min="1"
              step="0.01"
              className="input input-bordered w-full text-black"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFoodImageChange(idx, e.target.files[0])}
              className="file-input file-input-bordered w-full text-black"
            />
            {food.imagePreview && (
              <img src={food.imagePreview} alt="Food Preview" className="mt-2 w-20 h-20 object-cover rounded" />
            )}
            <Button variant="outlined" color="error" onClick={() => removeFoodItem(idx)}>
              Remove Item
            </Button>
          </div>
        ))}
        <Button variant="outlined" color="primary" onClick={addFoodItem}>
          Add Menu Item
        </Button>
      </Box>

      {/* Submit */}
      <button type="submit" className="btn btn-primary">
        {editingRestaurant ? "Update Restaurant" : "Add Restaurant"}
      </button>
    </form>
  );
}
