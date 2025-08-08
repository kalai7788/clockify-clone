import React from 'react';

const TimerControls = ({ 
  isRunning, 
  isPaused, 
  onStart, 
  onPause, 
  onResume, 
  onStop, 
  onReset,
  canSave = false,
  onSave
}) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
        >
          ▶️ Start
        </button>
      ) : (
        <>
          {!isPaused ? (
            <button
              onClick={onPause}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
            >
              ⏸️ Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
            >
              ▶️ Resume
            </button>
          )}
          
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
          >
            ⏹️ Stop
          </button>
        </>
      )}
      
      <button
        onClick={onReset}
        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
      >
        🔄 Reset
      </button>
      
      {canSave && (
        <button
          onClick={onSave}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
        >
          💾 Save
        </button>
      )}
    </div>
  );
};

export default TimerControls;