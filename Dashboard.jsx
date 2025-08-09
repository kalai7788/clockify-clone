// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard({ projects = [], clients = [] }) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(0); // seconds
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const seconds = (secs % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Handle timer start/stop
  const toggleTimer = () => {
    if (timerRunning) {
      // On stop → save to recent activity
      if (description && selectedProject) {
        const projectName =
          projects.find((p) => p.id.toString() === selectedProject)?.name ||
          "Unknown Project";

        setRecentActivity((prev) => [
          {
            id: Date.now(),
            task: description,
            project: projectName,
            time: formatTime(time),
          },
          ...prev,
        ]);
      }
      setTime(0);
      setDescription("");
      setSelectedProject("");
    }
    setTimerRunning((prev) => !prev);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
    

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="text-gray-500 text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        {/* Timer Section */}
        <section className="flex items-center space-x-4 bg-white p-4 rounded shadow mb-8">
          <button
            onClick={toggleTimer}
            className={`p-3 rounded-full ${
              timerRunning ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {timerRunning ? "■" : "▶"}
          </button>

          <input
            type="text"
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-grow border border-gray-300 rounded p-2"
          />

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Select Project</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <div className="text-2xl font-bold">{formatTime(time)}</div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-gray-700 mb-2">Today</div>
            <div className="text-blue-600 font-bold text-3xl">0m</div>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-gray-700 mb-2">This Week</div>
            <div className="text-green-600 font-bold text-3xl">0m</div>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-gray-700 mb-2">Projects</div>
            <div className="text-purple-600 font-bold text-3xl">
              {projects.length}
            </div>
            <Link
              to="/projects"
              className="block mt-2 text-blue-500 hover:underline"
            >
              View Projects
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <ul className="space-y-3">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="bg-white p-4 rounded shadow flex justify-between"
                >
                  <div>
                    <div className="font-medium">{item.task}</div>
                    <div className="text-sm text-gray-500">{item.project}</div>
                  </div>
                  <div className="text-gray-500">{item.time}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
