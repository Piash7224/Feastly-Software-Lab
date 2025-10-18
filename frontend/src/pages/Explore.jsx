import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// Import a simple search icon component
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

export default function Explore() {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const fetchRestaurants = async (searchQuery = "", pageNum = 1) => {
    setLoading(true);
    try {
      // Fetch restaurants
      const url = searchQuery
        ? `http://localhost:5001/api/restaurants?query=${searchQuery}&page=${pageNum}&limit=12`
        : `http://localhost:5001/api/restaurants?page=${pageNum}&limit=12`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch restaurants");

      const data = await res.json();
      
      // Store restaurant data temporarily to avoid race conditions
      const restaurantsData = data.restaurants;
      
      // Fetch table information for each restaurant
      const restaurantsWithTables = await Promise.all(
        data.restaurants.map(async (restaurant) => {
          try {
            const tableRes = await fetch(`http://localhost:5001/api/tables/restaurant/${restaurant._id}`);
            if (!tableRes.ok) throw new Error("Failed to fetch tables");
            const tableData = await tableRes.json();
            
            // Handle the case where tableData might be either an array or an object with a tables property
            const tables = Array.isArray(tableData) ? tableData : tableData.tables || [];
            
            // Calculate totals
            const totalSeats = tables.reduce((total, table) => {
              const capacity = parseInt(table.capacity) || 0;
              return total + capacity;
            }, 0);
            
            return {
              ...restaurant,
              totalSeats,
              totalTables: tables.length
            };
          } catch (error) {
            console.error(`Error fetching tables for ${restaurant.name}:`, error);
            return {
              ...restaurant,
              totalSeats: 0,
              totalTables: 0
            };
          }
        })
      );

      if (pageNum === 1) {
        setRestaurants(restaurantsWithTables);
      } else {
        setRestaurants((prev) => [...prev, ...restaurantsWithTables]);
      }
      setPages(data.pages || 1);
      setSuggestions(searchQuery ? restaurantsWithTables.slice(0, 5) : []);
      setShowSuggestions(!!searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initialQuery = searchParams.get("query") || "";
    setQuery(initialQuery);
    setPage(1);
    fetchRestaurants(initialQuery, 1);
  }, [searchParams]);

  useEffect(() => {
    if (!query) {
      setPage(1);
      fetchRestaurants("", 1);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(() => {
      setPage(1);
      fetchRestaurants(query, 1);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants(query, 1);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (name) => {
    setQuery(name);
    setPage(1);
    fetchRestaurants(name, 1);
    setShowSuggestions(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(query, nextPage);
  };

  const locations = ["All", "Mirpur", "Shewrapara", "Mohakhali", "Banani", "Gulshan-1", "Gulshan-2", "Badda"];
  const [selectedLocation, setSelectedLocation] = useState("All");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0B1121] text-white pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold mb-4 text-white">
            Discover Restaurants
          </h1>
          <p className="text-slate-400 mb-8">
            Choose an area or browse all options below.
          </p>

          {/* Location Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedLocation === location
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Bar */}
        <div ref={wrapperRef} className="relative max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search restaurants..."
                className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
              >
                <SearchIcon />
              </button>
            </div>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((rest) => (
                  <button
                    key={rest._id}
                    onClick={() => handleSuggestionClick(rest.name)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                  >
                    {rest.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && page === 1 ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-slate-300">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">
                No restaurants found {query && `for "${query}"`}.
              </p>
            </div>
          ) : (
            restaurants
              .filter(restaurant => selectedLocation === "All" || restaurant.location === selectedLocation)
              .map((restaurant) => (
                <motion.div
                  key={restaurant._id}
                  variants={itemVariants}
                  className="group bg-[#111827] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-w-16 aspect-h-12 relative overflow-hidden">
                    <img
                      src={restaurant.image || "http://localhost:5001/uploads/default.png"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {restaurant.name || 'Restaurant Name'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {restaurant.location || 'Location not available'}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= (restaurant.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-yellow-400 font-medium">
                          {restaurant.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">
                          {restaurant.totalTables > 0 
                            ? `${restaurant.totalTables} Tables` 
                            : restaurant.totalTables === 0
                              ? 'No tables set'
                              : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">
                          {restaurant.totalSeats > 0 
                            ? `${restaurant.totalSeats} Seats` 
                            : restaurant.totalSeats === 0
                              ? 'No seats available'
                              : 'Loading...'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/booking/${restaurant._id}`, {
                          state: { restaurant },
                        })
                      }
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Book
                    </button>
                  </div>
                </motion.div>
              ))
          )}
        </div>

        {/* Load More Button */}
        {page < pages && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-slate-800 border border-slate-700 rounded-full text-white hover:bg-slate-700 transition-colors"
            >
              Load More Restaurants
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
