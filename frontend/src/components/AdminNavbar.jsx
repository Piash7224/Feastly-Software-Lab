import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminNavbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="w-full bg-gray-900 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-lg font-semibold">Admin Panel</div>
        <div className="flex items-center gap-4">
          <Link className={isActive("/admin/dashboard") ? "underline" : ""} to="/admin/dashboard">Dashboard</Link>
          <Link className={isActive("/admin/restaurants") ? "underline" : ""} to="/admin/restaurants">Restaurants</Link>
          <Link className={isActive("/admin/users") ? "underline" : ""} to="/admin/users">Users</Link>
          <Link className={isActive("/admin/revenue") ? "underline" : ""} to="/admin/revenue">Revenue</Link>
        </div>
      </div>
    </nav>
  );
}


