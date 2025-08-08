import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';

const ProjectSelector = ({ selectedProjectId, onProjectSelect, showCreateNew = true }) => {
  const { projects, getActiveProjects } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeProjects = getActiveProjects();
  const filteredProjects = activeProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleSelect = (project) => {
    onProjectSelect(project);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedProject ? (
            <>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedProject.color }}
              />
              <span>{selectedProject.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Select project...</span>
          )}
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredProjects.map(project => (
              <button
                key={project.id}
                onClick={() => handleSelect(project)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                <div>
                  <div className="font-medium">{project.name}</div>
                  {project.client && (
                    <div className="text-sm text-gray-500">{project.client}</div>
                  )}
                </div>
              </button>
            ))}
            
            {filteredProjects.length === 0 && searchTerm && (
              <div className="px-4 py-3 text-gray-500 text-sm">
                No projects found matching "{searchTerm}"
              </div>
            )}
            
            {showCreateNew && (
              <button
                onClick={() => {
                  // TODO: Open project creation modal
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 text-blue-600 border-t border-gray-200 flex items-center gap-2"
              >
                <span>➕</span>
                <span>Create new project</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;