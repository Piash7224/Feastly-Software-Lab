import React from "react";



export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-700 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} Feastly. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a className="text-slate-300 hover:text-white" href="#">Privacy</a>
          <a className="text-slate-300 hover:text-white" href="#">Terms</a>
          <a className="text-slate-300 hover:text-white" href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}


