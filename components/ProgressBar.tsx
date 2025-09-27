import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration }) => {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="mt-2 px-1 w-full">
      <div className="relative h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full group">
        <div
          className="absolute h-1.5 bg-cyan-600 rounded-full z-10"
          style={{ width: `${progressPercentage}%` }}
        />
        <div
          className="absolute w-3 h-3 -top-1 bg-white dark:bg-gray-200 border-2 border-cyan-600 rounded-full z-20 transition-transform group-hover:scale-125"
          style={{ left: `calc(${progressPercentage}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
