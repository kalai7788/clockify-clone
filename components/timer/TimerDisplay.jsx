import React from 'react';

const TimerDisplay = ({ formattedTime, isRunning, isPaused }) => {
  return (
    <div className="text-center mb-8">
      <div className={`text-6xl font-mono font-bold mb-4 transition-colors ${
        isRunning && !isPaused ? 'text-green-600' : 
        isPaused ? 'text-yellow-600' : 
        'text-gray-800'
      }`}>
        {formattedTime}
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        {isRunning && (
          <>
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
            <span>{isPaused ? 'Paused' : 'Running'}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;