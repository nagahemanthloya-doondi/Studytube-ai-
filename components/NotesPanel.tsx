import React from 'react';
import type { Timestamp, Message } from '../types';
import TimestampManager from './TimestampManager';
import Chatbot from './Chatbot';
import PdfView from './PdfView';

interface NotesPanelProps {
  timestamps: Timestamp[];
  setTimestamps: React.Dispatch<React.SetStateAction<Timestamp[]>>;
  onTimestampClick: (time: number) => void;
  currentTime: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isBotTyping: boolean;
  pdfFileUrl: string | null;
  onPdfUpload: (file: File) => void;
  onPdfClear: () => void;
}

const TABS = ['PDF', 'Highlights', 'AI Assistant'];

const NotesPanel: React.FC<NotesPanelProps> = (props) => {
    const { activeTab, setActiveTab } = props;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-2 overflow-x-auto flex-shrink-0">
            {TABS.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === tab ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
        
        <div className="flex-grow min-h-0">
            {activeTab === 'Highlights' && <TimestampManager {...props} />}
            {activeTab === 'AI Assistant' && (
                <Chatbot 
                    messages={props.messages} 
                    onSendMessage={props.onSendMessage} 
                    isBotTyping={props.isBotTyping}
                    onClose={() => setActiveTab('Highlights')}
                />
            )}
            {activeTab === 'PDF' && (
                <PdfView
                    pdfFileUrl={props.pdfFileUrl}
                    onPdfUpload={props.onPdfUpload}
                    onPdfClear={props.onPdfClear}
                />
            )}
        </div>
    </div>
  );
};

export default NotesPanel;