import React, { useState } from 'react';
import { useTimerContext } from '../../context/TimerContext';
import { useProjectContext } from '../../context/ProjectContext';
import ProjectSelector from '../projects/ProjectSelector';
import { getTodayDateString } from '../../utils/dateHelpers';
import { timeStringToSeconds } from '../../utils/timeFormat';

const ManualTimeEntry = ({ isOpen, onClose }) => {
  const { addTimeLog } = useTimerContext();
  useProjectContext();
  
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    startDate: getTodayDateString(),
    startTime: '09:00',
    endTime: '10:00',
    duration: '01:00:00'
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [useEndTime, setUseEndTime] = useState(true);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData(prev => ({ ...prev, projectId: project.id }));
  };

  const calculateDuration = (start, end) => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    let durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

  const handleTimeChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (useEndTime && (field === 'startTime' || field === 'endTime')) {
      newFormData.duration = calculateDuration(
        field === 'startTime' ? value : formData.startTime,
        field === 'endTime' ? value : formData.endTime
      );
    }
    
    setFormData(newFormData);
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => ({ ...prev, duration }));
    
    if (useEndTime) {
      const durationSeconds = timeStringToSeconds(duration);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      
      const startTotalSeconds = startHours * 3600 + startMinutes * 60;
      const endTotalSeconds = startTotalSeconds + durationSeconds;
      
      const endHours = Math.floor(endTotalSeconds / 3600) % 24;
      const endMinutes = Math.floor((endTotalSeconds % 3600) / 60);
      
      const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, endTime: newEndTime }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.description.trim()) {
      alert('Please select a project and add a description');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = useEndTime 
      ? new Date(`${formData.startDate}T${formData.endTime}`)
      : new Date(startDateTime.getTime() + timeStringToSeconds(formData.duration) * 1000);

    addTimeLog({
      projectId: formData.projectId,
      projectName: selectedProject.name,
      description: formData.description,
      duration: timeStringToSeconds(formData.duration),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      type: 'manual'
    });

    // Reset form
    setFormData({
      projectId: '',
      description: '',
      startDate: getTodayDateString(),
      startTime: '09:00',
      endTime: '10:00',
      duration: '01:00:00'
    });
    setSelectedProject(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Time Entry</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <ProjectSelector
                selectedProjectId={formData.projectId}
                onProjectSelect={handleProjectSelect}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What did you work on?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {useEndTime ? 'End Time' : 'Duration'}
                </label>
                {useEndTime ? (
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    placeholder="01:30:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="useEndTime"
                checked={useEndTime}
                onChange={(e) => setUseEndTime(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="useEndTime" className="ml-2 text-sm text-gray-700">
                Use end time instead of duration
              </label>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
              <strong>Duration:</strong> {formData.duration}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualTimeEntry;