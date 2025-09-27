import React, { useState, useRef, useEffect } from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { FocusIcon } from './icons/FocusIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import type { Theme, HistoryItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  history: HistoryItem[];
  onLoadVideo: (url: string) => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const Header: React.FC<HeaderProps> = ({ history, onLoadVideo, isFocusMode, onToggleFocusMode, theme, onToggleTheme }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHistoryClick = (url: string) => {
    onLoadVideo(url);
    setIsHistoryOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 relative z-10">
      <div className="container mx-auto px-4 lg:px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          StudyTube
        </h1>
        <div className="flex items-center gap-2">
          <AnimatePresence>
          {!isFocusMode && (
            <motion.div
                key="history-button"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="relative" ref={historyRef}
            >
              <button 
                onClick={() => setIsHistoryOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <HistoryIcon /> History
              </button>
              <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-50"
                >
                  <ul className="py-1 max-h-80 overflow-y-auto">
                    {history.length > 0 ? (
                      history.map((item, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleHistoryClick(item.url)}
                            title={item.url}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="truncate block">{item.title}</span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-500">No recent videos.</li>
                    )}
                  </ul>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          )}
          </AnimatePresence>
          <button 
            onClick={onToggleFocusMode}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <FocusIcon /> {isFocusMode ? 'Exit' : 'Focus'}
          </button>
          <AnimatePresence>
          {!isFocusMode && (
            <motion.div
              key="theme-toggle"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <button 
                  onClick={onToggleTheme}
                  className="flex items-center justify-center p-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
