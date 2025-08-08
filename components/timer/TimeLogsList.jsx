import React, { useState } from 'react';
import { useTimerContext } from '../../context/TimerContext';
import { useProjectContext } from '../../context/ProjectContext';
import { formatTime, formatTime12Hour, getRelativeDate } from '../../utils/dateHelpers';
import Modal from '../common/Modal';

const TimeLogsList = () => {
  const { timeLogs, updateTimeLog, deleteTimeLog, getTodayLogs } = useTimerContext();
  const { projects } = useProjectContext();
  const [editingLog, setEditingLog] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'

  const getFilteredLogs = () => {
    switch (filter) {
      case 'today':
        return getTodayLogs();
      case 'week':
        { const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return timeLogs.filter(log => new Date(log.startTime) >= weekAgo); }
      default:
        return timeLogs;
    }
  };

  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  const handleEdit = (log) => {
    setEditingLog({ ...log });
  };

  const handleSaveEdit = () => {
    if (editingLog) {
      updateTimeLog(editingLog.id, {
        description: editingLog.description,
        duration: editingLog.duration
      });
      setEditingLog(null);
    }
  };

  const handleDelete = (logId) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      deleteTimeLog(logId);
    }
  };

  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId);
  };

  const filteredLogs = getFilteredLogs();
  const groupedLogs = groupLogsByDate(filteredLogs);
  const totalTime = filteredLogs.reduce((total, log) => total + log.duration, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Time Entries</h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {filteredLogs.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">
            Total Time ({filter === 'all' ? 'All' : filter === 'today' ? 'Today' : 'This Week'}): {formatTime(totalTime)}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedLogs)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .map(([date, logs]) => {
            const dayTotal = logs.reduce((total, log) => total + log.duration, 0);
            
            return (
              <div key={date} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{getRelativeDate(date)}</h4>
                  <span className="text-sm text-gray-500 font-mono">{formatTime(dayTotal)}</span>
                </div>
                
                <div className="space-y-2">
                  {logs
                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                    .map(log => {
                      const project = getProjectInfo(log.projectId);
                      
                      return (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            {project && (
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: project.color }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {project?.name || 'Unknown Project'}
                              </div>
                              <div className="text-gray-600 text-sm truncate">
                                {log.description || 'No description'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {formatTime12Hour(log.startTime)} - {formatTime12Hour(log.endTime)}
                                {log.type === 'manual' && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    Manual
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="font-mono font-semibold text-right">
                              {formatTime(log.duration)}
                            </div>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(log)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit entry"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleDelete(log.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete entry"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⏰</div>
          <p>No time entries found</p>
          <p className="text-sm">Start the timer or add a manual entry to get started!</p>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        title="Edit Time Entry"
      >
        {editingLog && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingLog.description}
                onChange={(e) => setEditingLog(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={formatTime(editingLog.duration)}
                onChange={(e) => {
                  // eslint-disable-next-line no-undef
                  const seconds = timeStringToSeconds(e.target.value);
                  setEditingLog(prev => ({ ...prev, duration: seconds }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="01:30:00"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditingLog(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TimeLogsList;