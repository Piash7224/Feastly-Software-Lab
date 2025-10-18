import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Fade,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { motion } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // ✅ Check login state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (token && name && role) {
      setUser({ name, role });
    }
  }, []);

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    handleMenuClose();
    navigate("/login");
  };

  // ✅ Menu control
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <motion.nav
      className="bg-slate-900 backdrop-blur border-b border-slate-800 text-slate-200"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap justify-between items-center gap-4">


        {/* 🍽️ Logo */}
        <Link to="/" className="text-slate-100 text-xl font-semibold tracking-tight flex items-center gap-2">
          <span role="img" aria-label="restaurant">🍽️</span>
          Feastly
        </Link>

        {/* 🧭 Navigation Links (Updated) */}
        <ul className="hidden md:flex flex-wrap space-x-6 text-slate-300 font-medium items-center">
          <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
          <li><Link to="/explore" className="hover:text-white transition-colors">Explore</Link></li>
          
          {/* ✨ ADDED: Profile link, shows if logged in */}
          {user && (
            <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
          )}

          {/* ➕ Only show for owner */}
          {user?.role === "owner" && (
            <li>
              <Link to="/restaurants/add" className="hover:text-white transition-colors">
                Add Restaurant
              </Link>
            </li>
          )}
        </ul>
        
        {/* ❌ REMOVED: Search Bar is no longer here */}

        {/* 👤 User Menu / Auth Buttons */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md border border-slate-700 text-sm text-slate-200 hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={handleMenuOpen}
              >
                <Avatar sx={{ bgcolor: "#f97316", width: 36, height: 36 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <ArrowDropDownIcon style={{ color: "white" }} />
              </div>

              {/* ✨ Animated Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem disabled>
                  <strong>{user.name}</strong> ({user.role})
                </MenuItem>
                <Divider />

                <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>
                  Profile
                </MenuItem>

                {user.role === "owner" && (
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/restaurants/add"); }}>
                    Add Restaurant
                  </MenuItem>
                )}

                {user.role === "admin" && (
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/admin/dashboard"); }}>
                    Admin Dashboard
                  </MenuItem>
                )}

                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}