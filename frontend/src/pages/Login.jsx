import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate form inputs
  const validateForm = () => {
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await axios.post("/api/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);

      toast.success("Login successful!");

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/"); // customer or owner
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left side: Welcome text and background image */}
      <div 
        className="hidden md:flex flex-col justify-center items-start w-1/2 bg-cover bg-center px-12 relative" 
        style={{
          backgroundImage: `url(http://localhost:5001/uploads/1759258063707-989802715-dimly-lit,-elegant-restaurant-setting-with-sophistication,-neatly-arranged-tables,-and-a-cozy-ambiance.png)`
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to Feastly</h2>
          <p className="text-lg text-slate-200">Sign in to access your personalized dining experience.</p>
        </div>
      </div>
      {/* Right side: Login card */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen">
        <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl shadow-xl p-8 text-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
                className="w-full border border-slate-700 bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-200"
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded-lg font-semibold transition duration-200`}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-400 hover:underline font-medium"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
