import React from 'react';

const ProjectsTab = () => {
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete website overhaul for client',
      color: 'bg-blue-500',
      totalTime: '24:15:30'
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'React Native development',
      color: 'bg-green-500',
      totalTime: '18:45:22'
    },
    {
      id: 3,
      name: 'Research Project',
      description: 'Market analysis and competitor research',
      color: 'bg-purple-500',
      totalTime: '12:30:15'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Projects</h2>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
            + New Project
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 ${project.color} rounded-full`}></div>
                <h3 className="font-semibold text-lg">{project.name}</h3>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="text-2xl font-bold text-gray-800">{project.totalTime}</div>
              <div className="text-gray-500 text-sm">Total time tracked</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;