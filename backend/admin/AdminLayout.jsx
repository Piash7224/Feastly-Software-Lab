import React from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavbar />
      <main className="pt-4 px-4 md:px-8 max-w-7xl mx-auto flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}


