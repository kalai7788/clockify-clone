import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TimerTab from '../timer/TimerTab';
import ProjectsTab from '../projects/ProjectsTab';
import SettingsTab from '../settings/SettingsTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('timer');

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return <TimerTab />;
      case 'projects':
        return <ProjectsTab />;
      case 'reports':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold">Reports (Coming Soon)</h2>
            <p className="text-gray-600 mt-2">Advanced reporting features will be available in Phase 5.</p>
          </div>
        );
      case 'team':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold">Team (Coming Soon)</h2>
            <p className="text-gray-600 mt-2">Team collaboration features will be available in Phase 4.</p>
          </div>
        );
      case 'settings':
        return <SettingsTab />;
      default:
        return <TimerTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;