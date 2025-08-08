import React, { createContext, useContext } from 'react';
import { useProjects } from '../hooks/useProjects';

const ProjectContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const projects = useProjects();

  return (
    <ProjectContext.Provider value={projects}>
      {children}
    </ProjectContext.Provider>
  );
};