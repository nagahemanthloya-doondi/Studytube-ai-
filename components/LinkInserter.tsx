import React, { useState } from 'react';
import type { InsertedLink } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkInserterProps {
  insertedLinks: InsertedLink[];
  setInsertedLinks: React.Dispatch<React.SetStateAction<InsertedLink[]>>;
  currentTime: number;
}

const LinkInserter: React.FC<LinkInserterProps> = ({ insertedLinks, setInsertedLinks, currentTime }) => {
  const [url, setUrl] = useState('');

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Add protocol if missing
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      finalUrl = 'https://' + url;
    }

    const newLink: InsertedLink = {
      id: Date.now().toString(),
      time: Math.floor(currentTime),
      url: finalUrl,
      triggered: false,
    };

    setInsertedLinks(prev => [...prev, newLink].sort((a,b) => a.time - b.time));
    setUrl('');
  };
  
  const removeLink = (id: string) => {
    setInsertedLinks(prev => prev.filter(link => link.id !== id));
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full p-1">
      <form onSubmit={handleAddLink} className="space-y-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all active:scale-95"
        >
          Add Link at Current Time ({formatTime(currentTime)})
        </button>
      </form>
       <div className="mt-4 flex-grow overflow-y-auto pr-2 min-h-0">
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
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md"
              >
                <div>
                   <span className="font-mono font-semibold text-primary-600 dark:text-primary-400 mr-3">
                    {formatTime(link.time)}
                  </span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                    {link.url}
                  </a>
                </div>
                <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full transition-colors">&times;</button>
              </motion.li>
            ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <p className="text-center text-gray-500 mt-4">No links inserted.</p>
        )}
      </div>
    </div>
  );
};

export default LinkInserter;