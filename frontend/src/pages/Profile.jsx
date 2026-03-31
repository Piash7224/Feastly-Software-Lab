import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "", role: "", phone: "" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      window.location.href = "/login";
      return;
    }

    axiosInstance
      .get("/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {
        toast.error("Please login");
        window.location.href = "/login";
      });
  }, [token]);

  const validateForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!emailPattern.test(profile.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (profile.phone && !/^\+?\d{7,15}$/.test(profile.phone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (password) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }
      if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        toast.error("Password must contain at least one letter and one number");
        return false;
      }
      if (password !== confirm) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = { ...profile };
    if (password) payload.password = password;

    try {
      const { data } = await axiosInstance.put("/profile", payload);
      setProfile(data.user);
      localStorage.setItem("name", data.user.name);
      toast.success("Profile updated successfully");
      setPassword("");
      setConfirm("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h2>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">{profile.name || "User"}</div>
            <div className="text-gray-600">{profile.email}</div>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              profile.role === "admin"
                ? "bg-red-50 text-red-700 border border-red-200"
                : profile.role === "owner"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {profile.role || "customer"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Full Name"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed text-black"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Phone Number"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white py-2 rounded-lg font-semibold transition duration-200`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
