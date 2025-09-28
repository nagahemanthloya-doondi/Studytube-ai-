import React, { useState } from 'react';
// FIX: Replaced deprecated 'Timestamp' type with 'TimestampedNote' to align with the application's current data model.
import type { TimestampedNote, InsertedLink } from '../types';
import TimestampManager from './TimestampManager';
import LinkInserter from './LinkInserter';

interface ControlPanelProps {
  // FIX: Updated the type from Timestamp[] to TimestampedNote[]
  timestamps: TimestampedNote[];
  // FIX: Updated the type from Timestamp[] to TimestampedNote[]
  setTimestamps: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  insertedLinks: InsertedLink[];
  setInsertedLinks: React.Dispatch<React.SetStateAction<InsertedLink[]>>;
  onTimestampClick: (time: number) => void;
  currentTime: number;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'timestamps' | 'links'>('timestamps');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full flex flex-col">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button 
                onClick={() => setActiveTab('timestamps')}
                className={`px-4 py-2 font-semibold transition-colors duration-200 ${activeTab === 'timestamps' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                Timestamps
            </button>
            <button 
                onClick={() => setActiveTab('links')}
                className={`px-4 py-2 font-semibold transition-colors duration-200 ${activeTab === 'links' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                Insert Links
            </button>
        </div>
        <div className="flex-grow min-h-0">
            {activeTab === 'timestamps' && <TimestampManager {...props} />}
            {activeTab === 'links' && <LinkInserter {...props} />}
        </div>
    </div>
  );
};

export default ControlPanel;