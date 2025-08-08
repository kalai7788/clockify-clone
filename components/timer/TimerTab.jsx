import React, { useState } from 'react';
import { useTimerContext } from '../../context/TimerContext';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import ProjectSelector from '../projects/ProjectSelector';
import ManualTimeEntry from './ManualTimeEntry';
import TimeLogsList from './TimeLogsList';

const TimerTab = () => {
  const { 
    time, 
    formattedTime, 
    isRunning, 
    isPaused, 
    start, 
    pause, 
    resume, 
    stop, 
    reset,
    saveTimeLog 
  } = useTimerContext();
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [description, setDescription] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const handleSave = () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    
    saveTimeLog(selectedProject.id, selectedProject.name, description);
    setDescription('');
    setSelectedProject(null);
  };

  const handleStop = () => {
    stop();
    if (time > 0 && selectedProject) {
      if (confirm('Do you want to save this time entry?')) {
        handleSave();
      }
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold">Time Tracker</h2>
        
        {/* Timer Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <TimerDisplay 
            time={time}
            formattedTime={formattedTime}
            isRunning={isRunning}
            isPaused={isPaused}
          />
          
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onStop={handleStop}
            onReset={reset}
            canSave={time > 0 && selectedProject}
            onSave={handleSave}
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <ProjectSelector
                selectedProjectId={selectedProject?.id}
                onProjectSelect={handleProjectSelect}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowManualEntry(true)}
              className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all"
            >
              + Add Manual Entry
            </button>
          </div>
        </div>

        {/* Time Logs Section */}
        <TimeLogsList />

        {/* Manual Time Entry Modal */}
        <ManualTimeEntry
          isOpen={showManualEntry}
          onClose={() => setShowManualEntry(false)}
        />
      </div>
    </div>
  );
};

export default TimerTab;