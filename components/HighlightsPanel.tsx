
import React, { useState } from 'react';
import type { TimestampedNote } from '../types';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface HighlightsPanelProps {
  timestamps: TimestampedNote[];
  setTimestamps: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  onTimestampClick: (time: number) => void;
}

const HighlightsPanel: React.FC<HighlightsPanelProps> = ({ timestamps, setTimestamps, onTimestampClick }) => {
  const [bulkNotes, setBulkNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const executeParse = () => {
    const lines = bulkNotes.split('\n');
    const newTimestamps: TimestampedNote[] = [];
    const regex = /[{\[(\(]\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:\.\d+)?\s*[)\]}]/;

    lines.forEach((line, index) => {
      const match = line.match(regex);
      if (match) {
        const description = line.replace(regex, '').trim();
        const hours = match[1] ? parseInt(match[1], 10) : 0;
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
        newTimestamps.push({ id: `${timeInSeconds}-${index}`, time: timeInSeconds, content: description });
      }
    });

    setTimestamps(newTimestamps.sort((a, b) => a.time - b.time));
    setBulkNotes('');
    setIsConfirmModalOpen(false);
  };

  const handleParseClick = () => {
    if (!bulkNotes.trim()) return;
    if (timestamps.length > 0) {
      setIsConfirmModalOpen(true);
    } else {
      executeParse();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Parse Highlights from Notes</h3>
        <textarea
          value={bulkNotes}
          onChange={(e) => setBulkNotes(e.target.value)}
          placeholder="Paste notes, e.g., [01:23] or (1:15:30) Topic."
          className="w-full h-32 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleParseClick}
          className="mt-2 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 disabled:bg-cyan-400 dark:disabled:bg-cyan-800 disabled:cursor-not-allowed transition-all active:scale-95"
          disabled={!bulkNotes.trim()}
        >
          Parse Highlights
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 p-4 min-h-0">
        {timestamps.length > 0 ? (
          <motion.ul layout className="space-y-2">
            <AnimatePresence>
            {timestamps.map((ts) => (
              <motion.li 
                key={ts.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => onTimestampClick(ts.time)}
                  className="w-full text-left p-3 rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 mr-3">
                    {formatTime(ts.time)}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200">{ts.content}</span>
                </button>
              </motion.li>
            ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="text-center text-gray-500 my-4 px-4 text-sm">
            <p>No highlights yet. Paste notes in the text box above and click "Parse Highlights" to begin.</p>
          </div>
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

export default HighlightsPanel;
