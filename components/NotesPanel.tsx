

import React from 'react';
import type { Message, QuizItem, InsertedLink, TimestampedNote } from '../types';
import HighlightsPanel from './HighlightsPanel';
import NotelinkPanel from './NotelinkPanel';
import Chatbot from './Chatbot';
import QuizView from './QuizView';

interface NotesPanelProps {
  insertedLinks: InsertedLink[];
  setInsertedLinks: React.Dispatch<React.SetStateAction<InsertedLink[]>>;
  notes: TimestampedNote[];
  setNotes: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  highlights: TimestampedNote[];
  setHighlights: React.Dispatch<React.SetStateAction<TimestampedNote[]>>;
  onTimestampClick: (time: number) => void;
  currentTime: number;
  duration: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isBotTyping: boolean;
  quiz: QuizItem[] | null;
  setQuiz: React.Dispatch<React.SetStateAction<QuizItem[] | null>>;
  isGeneratingQuiz: boolean;
  quizError: string | null;
  userAnswers: Record<number, string>;
  quizResult: { score: number; total: number } | null;
  onGenerateQuiz: () => void;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  onCheckAnswers: () => void;
  onResetQuiz: () => void;
  onPauseVideo: () => void;
  onPlayVideo: () => void;
}

const TABS = ['Highlights', 'Notelink', 'AI Quiz', 'AI Assistant'];

const NotesPanel: React.FC<NotesPanelProps> = (props) => {
    const { activeTab, setActiveTab } = props;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-[55vh] md:h-full flex flex-col">
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
            {activeTab === 'Highlights' && (
                <HighlightsPanel
                    timestamps={props.highlights}
                    setTimestamps={props.setHighlights}
                    onTimestampClick={props.onTimestampClick}
                    currentTime={props.currentTime}
                    duration={props.duration}
                />
            )}
            {activeTab === 'Notelink' && (
                <NotelinkPanel
                    insertedLinks={props.insertedLinks}
                    setInsertedLinks={props.setInsertedLinks}
                    timestampedNotes={props.notes}
                    setTimestampedNotes={props.setNotes}
                    onTimestampClick={props.onTimestampClick}
                    currentTime={props.currentTime}
                    onPause={props.onPauseVideo}
                    onResume={props.onPlayVideo}
                />
            )}
            {activeTab === 'AI Quiz' && (
              <QuizView
                quiz={props.quiz}
                setQuiz={props.setQuiz}
                isGeneratingQuiz={props.isGeneratingQuiz}
                quizError={props.quizError}
                userAnswers={props.userAnswers}
                quizResult={props.quizResult}
                onGenerateQuiz={props.onGenerateQuiz}
                onAnswerChange={props.onAnswerChange}
                onCheckAnswers={props.onCheckAnswers}
                onResetQuiz={props.onResetQuiz}
              />
            )}
            {activeTab === 'AI Assistant' && (
                <Chatbot 
                    messages={props.messages} 
                    onSendMessage={props.onSendMessage} 
                    isBotTyping={props.isBotTyping}
                    onClose={() => setActiveTab('Notelink')}
                />
            )}
        </div>
    </div>
  );
};

export default NotesPanel;