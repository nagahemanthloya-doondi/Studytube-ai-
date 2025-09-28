import React, { useState } from 'react';
// FIX: Replaced deprecated 'Timestamp' type with 'TimestampedNote' to align with the application's current data model.
import type { TimestampedNote, InsertedLink } from '../types';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface TimestampManagerProps {
  // FIX: Updated the type from Timestamp[] to TimestampedNote[]
  timestamps: TimestampedNote[];
  // FIX: Updated the type from Timestamp[] to TimestampedNote[]
  setTimestamps: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  insertedLinks: InsertedLink[];
  setInsertedLinks: React.Dispatch<React.SetStateAction<InsertedLink[]>>;
  onTimestampClick: (time: number) => void;
  currentTime: number;
}

const TimestampManager: React.FC<TimestampManagerProps> = (props) => {
  const { 
    timestamps, setTimestamps, 
    insertedLinks, setInsertedLinks, 
    onTimestampClick, currentTime 
  } = props;
  
  const [notes, setNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    // FIX: Changed to TimestampedNote, adding an 'id' and using 'content' instead of 'description'.
    const newTimestamp: TimestampedNote = {
        id: Date.now().toString(),
        time: Math.floor(currentTime),
        content: newDesc.trim()
    };
    setTimestamps(prev => [...prev, newTimestamp].sort((a, b) => a.time - b.time));
    setNewDesc('');
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    let finalUrl = newUrl;
    if (!/^https?:\/\//i.test(newUrl)) {
      finalUrl = 'https://' + newUrl;
    }

    const newLink: InsertedLink = {
      id: Date.now().toString(),
      time: Math.floor(currentTime),
      url: finalUrl,
      triggered: false,
    };

    setInsertedLinks(prev => [...prev, newLink].sort((a,b) => a.time - b.time));
    setNewUrl('');
  };
  
  const removeLink = (id: string) => {
    setInsertedLinks(prev => prev.filter(link => link.id !== id));
  };

  const executeParse = () => {
    const lines = notes.split('\n');
    // FIX: Changed to TimestampedNote[]
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
        
        // FIX: Changed to TimestampedNote, adding a unique 'id' and using 'content'.
        newTimestamps.push({ id: `${timeInSeconds}-${index}`, time: timeInSeconds, content: description });
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <form onSubmit={handleAddHighlight}>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={`Add highlight at ${formatTime(currentTime)}...`}
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
          />
        </form>
         <form onSubmit={handleAddLink} className="mt-3">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={`Add link at ${formatTime(currentTime)}...`}
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
          />
        </form>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 p-3 min-h-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Highlights</h3>
        {timestamps.length > 0 ? (
          <motion.ul layout className="space-y-2">
            <AnimatePresence>
            {timestamps.map((ts, index) => {
               const isActive = currentTime >= ts.time && (timestamps[index+1] ? currentTime < timestamps[index+1].time : true);
              return (
              <motion.li 
                // FIX: Used 'id' for a more reliable key.
                key={ts.id}
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
                  {/* FIX: Changed ts.description to ts.content */}
                  <span className="text-gray-800 dark:text-gray-200">{ts.content}</span>
                </button>
              </motion.li>
            )})}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="text-center text-gray-500 my-4 px-4 text-xs">
            <p>No highlights yet. Use the form above to add notes as you watch.</p>
          </div>
        )}
        
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">Inserted Links</h3>
        {insertedLinks.length > 0 ? (
            <motion.ul layout className="space-y-2">
            <AnimatePresence>
            {insertedLinks.map((link) => (
              <motion.li 
                key={link.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-md text-sm"
              >
                <div className="flex-1 overflow-hidden">
                   <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 mr-3">
                    {formatTime(link.time)}
                  </span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-gray-800 dark:text-gray-200">
                    {link.url}
                  </a>
                </div>
                <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-700 ml-2 p-1 rounded-full transition-colors text-lg leading-none">&times;</button>
              </motion.li>
            ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
           <div className="text-center text-gray-500 my-4 px-4 text-xs">
            <p>No links inserted. Use the form above to add links at specific times.</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bulk Add Highlights from Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste notes, e.g., [01:23] or (1:15:30) Topic."
          className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleParseClick}
          className="mt-2 w-full px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all active:scale-95"
          disabled={!notes.trim()}
        >
          Parse Notes
        </button>
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