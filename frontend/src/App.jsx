import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --------------------- Pages ---------------------
import HomePage from "./pages/HomePage";
import AddRestaurant from "./pages/AddRestaurant";
import EditRestaurant from "./pages/EditRestaurant";
import Booking from "./pages/Booking";
import Explore from "./pages/Explore";
import Food from "./pages/Food";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Receipt from "./pages/Receipt";
import Register from "./pages/Register";

// --------------------- Admin Pages ---------------------
import AdminDashboard from "./pages/admin/AdminDashboard";
import RestaurantManagement from "./pages/admin/RestaurantManagement";
import RevenueAnalytics from "./pages/admin/RevenueAnalytics";
import UserOwnerManagement from "./pages/admin/UserOwnerManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import WaitlistManagement from "./pages/admin/WaitlistManagement";
import AdminLayout from "./pages/admin/AdminLayout";

// --------------------- Components ---------------------
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --------------------- Route Guards ---------------------
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    return <Navigate to="/" replace />; // redirect non-admin users
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />; // redirect unauthenticated users
  }
  return children;
};

// --------------------- App ---------------------
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public/Default Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="pt-6 px-4 md:px-8">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/food" element={<Food />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipt"
            element={
              <ProtectedRoute>
                <Receipt />
              </ProtectedRoute>
            }
          />

          {/* Restaurant Management */}
          <Route
            path="/restaurants/add"
            element={
              <ProtectedRoute>
                <AddRestaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/edit/:id"
            element={
              <ProtectedRoute>
                <EditRestaurant />
              </ProtectedRoute>
            }
          />

          {/* Booking */}
          <Route path="/booking/:restaurantId" element={<Booking />} />

          {/* ---------------- Admin Routes ---------------- */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="restaurants" element={<RestaurantManagement />} />
                    <Route path="users" element={<UserOwnerManagement />} />
                    <Route path="revenue" element={<RevenueAnalytics />} />
                    <Route path="bookings" element={<BookingManagement />} />
                    <Route path="waitlist" element={<WaitlistManagement />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />

      {/* Global Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
