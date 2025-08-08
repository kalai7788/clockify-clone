import { useState, useEffect } from 'react';
import { localStorageService } from '../services/localStorage.service';

const defaultProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete website overhaul for client',
    color: '#3B82F6',
    client: 'Acme Corp',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'React Native mobile application',
    color: '#10B981',
    client: 'Tech Startup',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = () => {
      const savedProjects = localStorageService.getProjects();
      if (savedProjects.length === 0) {
        localStorageService.saveProjects(defaultProjects);
        setProjects(defaultProjects);
      } else {
        setProjects(savedProjects);
      }
      setLoading(false);
    };

    loadProjects();
  }, []);

  const addProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorageService.saveProjects(updatedProjects);
    return newProject;
  };

  const updateProject = (id, updates) => {
    const updatedProjects = projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    );
    setProjects(updatedProjects);
    localStorageService.saveProjects(updatedProjects);
  };

  const deleteProject = (id) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    localStorageService.saveProjects(updatedProjects);
  };

  const getActiveProjects = () => {
    return projects.filter(project => project.isActive);
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    getActiveProjects
  };
};