import { useState, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/timeFormat';

export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
    setEndTime(null);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTime(new Date());
  }, []);

  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setEndTime(null);
  }, []);

  return {
    time,
    isRunning,
    isPaused,
    formattedTime: formatTime(time),
    startTime,
    endTime,
    start,
    pause,
    resume,
    stop,
    reset
  };
};