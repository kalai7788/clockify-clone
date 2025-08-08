import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'timer', icon: '⏱️', label: 'Timer' },
    { id: 'projects', icon: '📁', label: 'Projects' },
    { id: 'reports', icon: '📊', label: 'Reports' },
    { id: 'team', icon: '👥', label: 'Team' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="bg-gray-900 w-64 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          ⏱️ TimeTracker
        </h1>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-white font-medium">{user?.displayName || 'User'}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;