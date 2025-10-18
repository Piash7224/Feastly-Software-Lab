import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ===== Form Validation =====
  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

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

    if (!["customer", "owner"].includes(role)) {
      toast.error("Invalid role selected");
      return false;
    }

    return true;
  };

  // ===== Handle Form Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await axios.post("/api/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left side: Join text and background image */}
      <div 
        className="hidden md:flex flex-col justify-center items-start w-1/2 bg-cover bg-center px-12 relative" 
        style={{
          backgroundImage: `url(http://localhost:5001/uploads/1759258063707-989802715-dimly-lit,-elegant-restaurant-setting-with-sophistication,-neatly-arranged-tables,-and-a-cozy-ambiance.png)`
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-lg text-slate-200">Create an account to discover amazing restaurants and save your favorites.</p>
        </div>
        
      </div>
      {/* Right side: Register card */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen">
        <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl shadow-xl p-8 text-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-200"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-200"
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-200"
              />
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-200"
              />
            </div>
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-200"
              >
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded-lg font-semibold transition duration-200`}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
