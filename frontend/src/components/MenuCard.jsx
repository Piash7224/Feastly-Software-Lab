import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuCard({ foodItems, preOrders, onPreOrderChange }) {
  const [selectedFood, setSelectedFood] = useState(null);
  const [showQuantity, setShowQuantity] = useState(false);

  const handleQuantityChange = (foodId, qty) => {
    if (qty < 0) qty = 0;
    onPreOrderChange(foodId, qty);
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowQuantity(true);
  };

  const foodCategories = [...new Set(foodItems.map((food) => food.category))];

  return (
    <div className="menu-card-container p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Menu</h2>

      {foodCategories.map((category, idx) => (
        <div key={category || `category-${idx}`} className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6 border-b-2 border-orange-400 pb-2">
            {category}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems
              .filter((food) => food.category === category)
              .map((food) => {
                const quantity =
                  preOrders.find((p) => p.food === food._id)?.quantity || 0;

                return (
                  <motion.div
                    key={food._id}
                    className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                    onClick={() => handleFoodClick(food)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {food.image ? (
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-lg">
                        ${food.price}
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {food.name}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {food.description || "No description"}
                      </p>

                      {/* Quantity selector - only shown when food is clicked */}
                      <AnimatePresence>
                        {selectedFood?._id === food._id && showQuantity && (
                          <motion.div
                            key={`quantity-${food._id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(food._id, quantity - 1);
                                }}
                                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                              >
                                -
                              </button>

                              <span className="w-8 text-center text-black">{quantity}</span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(food._id, quantity + 1);
                                }}
                                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                              >
                                +
                              </button>
                            </div>

                            {quantity > 0 && (
                              <span className="text-orange-500 font-semibold">
                                Total: ${(quantity * food.price).toFixed(2)}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
