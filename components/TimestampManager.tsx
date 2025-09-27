import React, { useState } from 'react';
import type { Timestamp } from '../types';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface TimestampManagerProps {
  timestamps: Timestamp[];
  setTimestamps: React.Dispatch<React.SetStateAction<Timestamp[]>>;
  onTimestampClick: (time: number) => void;
  currentTime: number;
}

const TimestampManager: React.FC<TimestampManagerProps> = ({ timestamps, setTimestamps, onTimestampClick, currentTime }) => {
  const [notes, setNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const executeParse = () => {
    const lines = notes.split('\n');
    const newTimestamps: Timestamp[] = [];
    const regex = /[{\[(\(]\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:\.\d+)?\s*[)\]}]/;

    lines.forEach(line => {
      const match = line.match(regex);
      if (match) {
        const description = line.replace(regex, '').trim();

        const hours = match[1] ? parseInt(match[1], 10) : 0;
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);

        const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
        
        newTimestamps.push({ time: timeInSeconds, description });
      }
    });

    setTimestamps(newTimestamps.sort((a, b) => a.time - b.time));
    setNotes('');
    setIsConfirmModalOpen(false);
  };

  const handleParseClick = () => {
    const hasNotes = notes.trim().length > 0;
    if (!hasNotes) return;

    if (timestamps.length > 0) {
      setIsConfirmModalOpen(true);
    } else {
      executeParse();
    }
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full p-1">
      <div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste notes, e.g., [01:23] or (1:15:30) Topic."
          className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleParseClick}
          className="mt-2 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800 disabled:bg-cyan-400 dark:disabled:bg-cyan-800 disabled:cursor-not-allowed transition-all active:scale-95"
          disabled={!notes.trim()}
        >
          Parse Highlights
        </button>
      </div>
      <div className="mt-4 flex-grow overflow-y-auto pr-2 min-h-0">
        {timestamps.length > 0 ? (
          <motion.ul layout className="space-y-2">
            <AnimatePresence>
            {timestamps.map((ts, index) => {
               const isActive = currentTime >= ts.time && (timestamps[index+1] ? currentTime < timestamps[index+1].time : true);
              return (
              <motion.li 
                key={`${ts.time}-${ts.description}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => onTimestampClick(ts.time)}
                  className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${isActive ? 'bg-cyan-100 dark:bg-cyan-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 mr-3">
                    {formatTime(ts.time)}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200">{ts.description}</span>
                </button>
              </motion.li>
            )})}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <p className="text-center text-gray-500 mt-4">No highlights yet. Paste notes with timestamps and click "Parse Highlights".</p>
        )}
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Overwrite Existing Highlights?"
        footer={
          <>
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeParse}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Overwrite
            </button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          This action will replace your current list of highlights. Are you sure you want to continue?
        </p>
      </Modal>
    </div>
  );
};

export default TimestampManager;