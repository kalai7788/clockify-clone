export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeShort = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const parseTimeString = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

export const formatDuration = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const durationMs = endTime - startTime;
  const durationSeconds = Math.floor(durationMs / 1000);
  return formatTime(durationSeconds);
};

export const timeStringToSeconds = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  
  const [hours, minutes, seconds] = parts.map(part => parseInt(part, 10) || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

export const secondsToTimeString = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(unit => unit.toString().padStart(2, '0'))
    .join(':');
};