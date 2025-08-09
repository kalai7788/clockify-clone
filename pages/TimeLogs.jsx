// src/pages/TimeLogs.jsx
import React, { useState } from "react";

export default function TimeLogs() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [dateFilter, setDateFilter] = useState("");

  // Example time entries
  const [entries] = useState([
    {
      id: 1,
      title: "Working on homepage design",
      project: "Website Redesign",
      client: "Acme Corp",
      color: "bg-blue-500",
      duration: "2h 30m",
      date: "2025-01-08",
      timeRange: "09:00 - 11:30",
    },
    {
      id: 2,
      title: "Bug fixes and testing",
      project: "Mobile App",
      client: "Tech Startup",
      color: "bg-green-500",
      duration: "2h 15m",
      date: "2025-01-08",
      timeRange: "14:00 - 16:15",
    },
  ]);

  // Filtering logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.project.toLowerCase().includes(search.toLowerCase()) ||
      entry.client.toLowerCase().includes(search.toLowerCase());

    const matchesProject =
      projectFilter === "All Projects" || entry.project === projectFilter;

    const matchesDate = !dateFilter || entry.date === dateFilter;

    return matchesSearch && matchesProject && matchesDate;
  });

  // Total time calculation
  const totalTime = filteredEntries.reduce((total, entry) => {
    const [hours, minutes] = entry.duration
      .replace("h", "")
      .replace("m", "")
      .split(" ")
      .map((n) => parseInt(n) || 0);
    return total + hours * 60 + minutes;
  }, 0);

  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time Logs</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 border rounded">Export</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            + Add Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Search time entries..."
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option>All Projects</option>
          <option>Website Redesign</option>
          <option>Mobile App</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Time Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-white border rounded shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${entry.color}`}></div>
              <div>
                <div className="font-medium">{entry.title}</div>
                <div className="text-sm text-gray-500">
                  {entry.project} • {entry.client}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{entry.duration}</div>
              <div className="text-sm text-gray-500">
                {new Date(entry.date).toDateString()} • {entry.timeRange}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Time */}
      <div className="text-right font-bold">
        Total: {totalHours}h {totalMinutes}m
      </div>
    </div>
  );
}
