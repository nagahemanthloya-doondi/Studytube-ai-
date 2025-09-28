
import React, { useState } from 'react';
import type { InsertedLink, TimestampedNote } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

interface NotelinkPanelProps {
  insertedLinks: InsertedLink[];
  setInsertedLinks: React.Dispatch<React.SetStateAction<InsertedLink[]>>;
  timestampedNotes: TimestampedNote[];
  setTimestampedNotes: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  currentTime: number;
  onTimestampClick: (time: number) => void;
  onPause: () => void;
  onResume: () => void;
}

const NotelinkPanel: React.FC<NotelinkPanelProps> = (props) => {
  const { 
    insertedLinks, setInsertedLinks, 
    timestampedNotes, setTimestampedNotes,
    currentTime, onTimestampClick,
    onPause, onResume
  } = props;

  const [isNoteOpen, setNoteOpen] = useState(true);
  const [isLinkOpen, setLinkOpen] = useState(true);

  const [newUrl, setNewUrl] = useState('');
  const [currentNote, setCurrentNote] = useState('');

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    onResume();
  };

  const handleSaveNote = () => {
    if (!currentNote.trim()) return;
    const newNote: TimestampedNote = {
      id: Date.now().toString(),
      time: Math.floor(currentTime),
      content: currentNote.trim(),
    };
    setTimestampedNotes(prev => [...prev, newNote].sort((a, b) => a.time - b.time));
    setCurrentNote('');
    onResume();
  };
  
  const removeLink = (id: string) => {
    setInsertedLinks(prev => prev.filter(link => link.id !== id));
  };
  
  const removeNote = (id: string) => {
    setTimestampedNotes(prev => prev.filter(note => note.id !== id));
  };

  const sectionVariants = {
    open: { opacity: 1, height: 'auto', marginTop: '1rem' },
    closed: { opacity: 0, height: 0, marginTop: 0 },
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {/* Add Note Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <button onClick={() => setNoteOpen(!isNoteOpen)} className="w-full flex justify-between items-center font-semibold text-lg">
            Add Note
            <ChevronDownIcon className={`transition-transform duration-300 ${isNoteOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
          {isNoteOpen && (
            <motion.div
              key="note-content"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sectionVariants}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Scratchpad</h3>
              <textarea
                value={currentNote}
                onFocus={onPause}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Jot down your thoughts here..."
                className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleSaveNote}
                className="mt-2 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 disabled:bg-cyan-400 dark:disabled:bg-cyan-800 transition-all active:scale-95"
                disabled={!currentNote.trim()}
              >
                Save Note at {formatTime(currentTime)}
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Add Link Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <button onClick={() => setLinkOpen(!isLinkOpen)} className="w-full flex justify-between items-center font-semibold text-lg">
            Add Link
            <ChevronDownIcon className={`transition-transform duration-300 ${isLinkOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
          {isLinkOpen && (
            <motion.div
              key="link-content"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sectionVariants}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddLink}>
                <input
                  type="text"
                  value={newUrl}
                  onFocus={onPause}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={`Add link at ${formatTime(currentTime)}...`}
                  className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                />
                 <button
                    type="submit"
                    className="mt-2 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 disabled:bg-cyan-400 dark:disabled:bg-cyan-800 transition-all active:scale-95"
                    disabled={!newUrl.trim()}
                >
                    Add Link
                </button>
              </form>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">Timestamped Notes</h3>
                {timestampedNotes.length > 0 ? (
                  <motion.ul layout className="space-y-2">
                    <AnimatePresence>
                    {timestampedNotes.map((note) => (
                      <motion.li
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md text-sm border dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <button onClick={() => onTimestampClick(note.time)} className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 mr-3 hover:underline">
                            {formatTime(note.time)}
                          </button>
                          <button onClick={() => removeNote(note.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors text-lg leading-none -mt-1">&times;</button>
                        </div>
                        <p className="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                      </motion.li>
                    ))}
                    </AnimatePresence>
                  </motion.ul>
                ) : (
                  <div className="text-center text-gray-500 my-4 px-4 text-xs">
                    <p>No notes saved. Use the scratchpad above to save notes with a timestamp.</p>
                  </div>
                )}
            </div>
            
            <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Inserted Links</h3>
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
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md text-sm border dark:border-gray-700"
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
        </div>
      </div>
    </div>
  );
};

export default NotelinkPanel;
