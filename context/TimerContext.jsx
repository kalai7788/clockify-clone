import React, { createContext, useContext } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useTimeLogs } from '../hooks/useTimeLogs';

const TimerContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const timer = useTimer();
  const timeLogs = useTimeLogs();

  const saveTimeLog = (projectId, projectName, description) => {
    if (timer.time > 0) {
      timeLogs.addTimeLog({
        projectId,
        projectName,
        description,
        duration: timer.time,
        startTime: timer.startTime,
        endTime: timer.endTime || new Date(),
        type: 'timer'
      });
      timer.reset();
    }
  };

  const value = {
    ...timer,
    ...timeLogs,
    saveTimeLog
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};