// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import TimeLogs from "./pages/TimeLogs";
export default function App() {
  // Shared state for clients (accessible by both pages)
  const [clients, setClients] = useState([
    { id: 1, name: "Client A" },
    { id: 2, name: "Client B" },
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={<Dashboard clients={clients} setClients={setClients} />}
          />
          <Route
            path="/projects"
            element={<Projects clients={clients} setClients={setClients} />}
          />
          <Route
            path="/time-logs"
            element={<TimeLogs clients={clients} setClients={setClients} />}
          />
        </Routes>
      </main>
    </div>
  );
}

/* Sidebar Component */
function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <h1 className="text-xl font-bold p-6 border-b">YaashFlow</h1>

      {/* Navigation */}
      <nav className="flex flex-col p-4 space-y-2 text-gray-700">
        <NavLink to="/" icon="🏠" label="Dashboard" />
        <NavLink to="/projects" icon="📁" label="Projects" />
        <NavLink to="/time-logs" icon="🕒" label="Time Logs" />
        <NavLink to="/reports" icon="📊" label="Reports" />
      </nav>

      {/* User Info */}
      <div className="mt-auto p-6 border-t text-gray-600 text-sm space-y-2">
        <div>User</div>
        <div>john@gmail.com</div>
        <div className="flex space-x-4">
          <button className="hover:underline">Settings</button>
          <button className="hover:underline">Logout</button>
        </div>
      </div>
    </aside>
  );
}

/* Reusable Navigation Link Component */
function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
