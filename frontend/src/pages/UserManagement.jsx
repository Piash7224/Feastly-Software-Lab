import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "admin") {
      toast.error("Access denied");
      window.location.href = "/";
      return;
    }
    fetchUsers();
  }, [token, role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/admin/users");
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id, isBlocked) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/status`, { isBlocked: !isBlocked });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status");
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/admin/users/${id}`);
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh list
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!users.length) return <div className="text-center mt-8">No users found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="px-4 py-2">{user._id}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">{user.isBlocked ? "Blocked" : "Active"}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleBlock(user._id, user.isBlocked)}
                  className={`mr-3 ${user.isBlocked ? "text-green-600" : "text-red-600"} hover:underline`}
                >
                  {user.isBlocked ? "Allow" : "Block"}
                </button>
                <button
                  onClick={() => deleteHandler(user._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
