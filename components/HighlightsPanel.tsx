

import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { TimestampedNote } from '../types';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface HighlightsPanelProps {
  timestamps: TimestampedNote[];
  setTimestamps: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  onTimestampClick: (time: number) => void;
  currentTime: number;
  duration: number;
}

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);


const HighlightsPanel: React.FC<HighlightsPanelProps> = ({ timestamps, setTimestamps, onTimestampClick, currentTime, duration }) => {
  const [bulkNotes, setBulkNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isParsingSectionOpen, setIsParsingSectionOpen] = useState(true);
  
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, timestamps.length);
  }, [timestamps]);

  const activeIndex = useMemo(() => {
    return timestamps.findIndex((ts, index) => {
        const nextTs = timestamps[index + 1];
        return currentTime >= ts.time && (nextTs ? currentTime < nextTs.time : true);
    });
  }, [timestamps, currentTime]);

  useEffect(() => {
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
        itemRefs.current[activeIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  }, [activeIndex]);


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
        <button
            onClick={() => setIsParsingSectionOpen(prev => !prev)}
            className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 dark:text-gray-200"
            aria-expanded={isParsingSectionOpen}
        >
            <span>Parse Highlights from Notes</span>
            <ChevronDownIcon className={`transition-transform duration-300 ${isParsingSectionOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
            {isParsingSectionOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                >
                    <textarea
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                      placeholder="Paste notes, e.g., [01:23] or (1:15:30) Topic."
                      className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={handleParseClick}
                      className="mt-2 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 disabled:bg-cyan-400 dark:disabled:bg-cyan-800 disabled:cursor-not-allowed transition-all active:scale-95"
                      disabled={!bulkNotes.trim()}
                    >
                      Parse Highlights
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 p-4 min-h-0">
        {timestamps.length > 0 ? (
          <motion.ul layout className="space-y-2">
            <AnimatePresence>
            {timestamps.map((ts, index) => {
              const nextTs = timestamps[index + 1];
              const isActive = currentTime >= ts.time && (nextTs ? currentTime < nextTs.time : true);
              
              const segmentEndTime = nextTs ? nextTs.time : duration;
              const segmentDuration = segmentEndTime - ts.time;

              let progressPercentage = 0;
              if (isActive && segmentDuration > 0) {
                  const progressInSegment = (currentTime - ts.time) / segmentDuration;
                  progressPercentage = Math.max(0, Math.min(100, progressInSegment * 100));
              }

              return (
              <motion.li 
                ref={el => (itemRefs.current[index] = el)}
                key={ts.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => onTimestampClick(ts.time)}
                  className={`relative w-full text-left p-3 rounded-md transition-all duration-200 overflow-hidden ${isActive ? 'bg-cyan-100 dark:bg-cyan-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {isActive && (
                    <motion.div 
                        layoutId="highlight-bar"
                        className="absolute left-0 top-0 h-full w-1 bg-cyan-500"
                        transition={{type: 'spring', stiffness: 300, damping: 30}}
                    />
                  )}
                  <div className={isActive ? 'ml-2' : ''}>
                    <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 mr-3">
                        {formatTime(ts.time)}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">{ts.content}</span>
                  </div>
                   {isActive && segmentDuration > 0 && (
                       <div className="absolute bottom-0 left-0 h-1 w-full bg-cyan-500/20">
                           <div
                             className="h-full bg-cyan-500 transition-all duration-500 ease-linear"
                             style={{ width: `${progressPercentage}%` }}
                           />
                       </div>
                    )}
                </button>
              </motion.li>
            )})}
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