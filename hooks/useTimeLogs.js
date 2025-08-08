import { useState, useEffect } from 'react';
import { localStorageService } from '../services/localStorage.service';
import { formatTime } from '../utils/timeFormat';

export const useTimeLogs = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLogs = localStorageService.getTimeLogs();
    setTimeLogs(savedLogs);
    setLoading(false);
  }, []);

  const addTimeLog = (logData) => {
    const newLog = {
      id: Date.now().toString(),
      ...logData,
      createdAt: new Date().toISOString()
    };
    
    const updatedLogs = [newLog, ...timeLogs];
    setTimeLogs(updatedLogs);
    localStorageService.saveTimeLogs(updatedLogs);
    return newLog;
  };

  const updateTimeLog = (id, updates) => {
    const updatedLogs = timeLogs.map(log =>
      log.id === id ? { ...log, ...updates } : log
    );
    setTimeLogs(updatedLogs);
    localStorageService.saveTimeLogs(updatedLogs);
  };

  const deleteTimeLog = (id) => {
    const updatedLogs = timeLogs.filter(log => log.id !== id);
    setTimeLogs(updatedLogs);
    localStorageService.saveTimeLogs(updatedLogs);
  };

  const getTodayLogs = () => {
    const today = new Date().toDateString();
    return timeLogs.filter(log => 
      new Date(log.startTime).toDateString() === today
    );
  };

  const getProjectTotalTime = (projectId) => {
    const projectLogs = timeLogs.filter(log => log.projectId === projectId);
    const totalSeconds = projectLogs.reduce((total, log) => total + log.duration, 0);
    return formatTime(totalSeconds);
  };

  return {
    timeLogs,
    loading,
    addTimeLog,
    updateTimeLog,
    deleteTimeLog,
    getTodayLogs,
    getProjectTotalTime
  };
};