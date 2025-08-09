// src/pages/Projects.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaStar } from "react-icons/fa";
import ClientForm from "../components/ClientForm";

export default function Projects({ clients, setClients }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected project from dashboard (optional highlight)
  const selectedProjectFromDashboard = location.state?.project || null;

  const [projects, setProjects] = useState([
    { id: 1, name: "Website Redesign", client: "Acme Corp", color: "bg-blue-500" },
    { id: 2, name: "Mobile App", client: "Tech Startup", color: "bg-green-500" },
    { id: 3, name: "Marketing Campaign", client: "Acme Corp", color: "bg-yellow-500" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);

  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newColor, setNewColor] = useState("bg-blue-500");

  const colors = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-red-500", "bg-purple-500", "bg-pink-500", "bg-gray-500"
  ];

  const deleteProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const addProject = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const selectedClient = clients.find((c) => c.id === parseInt(newClient));

    const newProject = {
      id: Date.now(),
      name: newName,
      client: selectedClient ? selectedClient.name : "No Client",
      color: newColor,
    };

    setProjects([...projects, newProject]);
    setIsModalOpen(false);
    setNewName("");
    setNewClient("");
    setNewColor("bg-blue-500");
  };

  const addClient = (clientData) => {
    setClients((prev) => [
      ...prev,
      { id: Date.now(), name: clientData.clientName }
    ]);
    setShowClientForm(false);
  };

  const goToProjectDetail = (project) => {
    navigate(`/projects/${project.id}`, { state: { project } });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowClientForm(true)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Add Client
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            + New Project
          </button>
        </div>
      </header>

      {/* Project List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`flex justify-between items-center bg-white p-4 rounded shadow cursor-pointer 
              ${selectedProjectFromDashboard?.id === project.id ? "ring-2 ring-blue-400" : ""}`}
            onClick={() => goToProjectDetail(project)}
          >
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${project.color}`}></span>
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-gray-500">{project.client}</p>
              </div>
            </div>
            <div className="flex space-x-3 text-gray-500">
              <FaStar className="cursor-pointer hover:text-yellow-500" />
              <FaEdit className="cursor-pointer hover:text-blue-500" />
              <FaTrash
                className="cursor-pointer hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">&times;</button>
            </div>

            <form onSubmit={addProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <select
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full border ${newColor === c ? "ring-2 ring-offset-2 ring-blue-500" : ""} ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          onSave={addClient}
          onCancel={() => setShowClientForm(false)}
        />
      )}
    </div>
  );
}
