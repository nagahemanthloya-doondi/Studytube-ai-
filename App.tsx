

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { InsertedLink, Theme, PlayerState, Message, HistoryItem, VideoSession, QuizItem, TimestampedNote, Course, Schedule, UserProfile, TodoItem } from './types';
import { Chat } from '@google/genai';
import { getGeminiChat, generateQuiz } from './services/geminiService';
import Header from './components/Header';
import CoursesPage from './components/UrlInputView';
import PlayerSection from './components/PlayerSection';
import NotesPanel from './components/NotesPanel';
import Modal from './components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import PdfView from './components/PdfView';
import BottomNavBar from './components/BottomNavBar';
import SchedulePage from './components/SchedulePage';
import HomePage from './components/HomePage';

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('studytube-theme', 'light');
  const [loadedVideoUrl, setLoadedVideoUrl] = useLocalStorage<string>('studytube-url', '');
  const [points, setPoints] = useLocalStorage<number>('studytube-points', 0);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('studytube-history', []);
  const [videoSessions, setVideoSessions] = useLocalStorage<Record<string, VideoSession>>('studytube-video-sessions', {});
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>('studytube-schedules', []);
  const [courses, setCourses] = useLocalStorage<Course[]>('studytube-courses', []);
  const [profile, setProfile] = useLocalStorage<UserProfile>('studytube-profile', {
    name: 'Filomena',
    birthday: '2002-07-20',
    school: 'UPC',
    yearLevel: '3RD YEAR',
    idPictureUrl: 'https://i.imgur.com/example.png', // Placeholder
    logoUrl: 'logo1',
    cardColor: '#ffc2d1',
  });
  const [homeTodos, setHomeTodos] = useLocalStorage<TodoItem[]>('studytube-home-todos', []);
  
  const [activeView, setActiveView] = useState('Home');


  const [insertedLinks, setInsertedLinks] = useState<InsertedLink[]>([]);
  const [notes, setNotes] = useState<TimestampedNote[]>([]);
  const [highlights, setHighlights] = useState<TimestampedNote[]>([]);
  const [videoTitle, setVideoTitle] = useState('Video Title Placeholder');
  
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    watchedSeconds: new Set(),
    hasSkipped: false,
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState('Notelink');
  
  // Quiz State
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number; total: number} | null>(null);

  // Link Modal State
  const [linkModalUrl, setLinkModalUrl] = useState<string | null>(null);

  // PDF State
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const previousVideoIdRef = useRef<string | null>(null);

  const pdfFileUrl = useMemo(() => (pdfFile ? URL.createObjectURL(pdfFile) : null), [pdfFile]);

  useEffect(() => {
    // Clean up object URL on component unmount or when file changes
    return () => {
      if (pdfFileUrl) {
        URL.revokeObjectURL(pdfFileUrl);
      }
    };
  }, [pdfFileUrl]);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    setChat(getGeminiChat());
  }, []);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const videoId = useMemo(() => {
    if (!loadedVideoUrl) return '';
    try {
      const url = new URL(loadedVideoUrl);
      if (url.hostname === 'youtu.be') {
        return url.pathname.slice(1);
      }
      if (url.hostname.includes('youtube.com')) {
        const videoIdParam = url.searchParams.get('v');
        if (videoIdParam) {
          return videoIdParam;
        }
      }
    } catch (error) {
      return '';
    }
    return '';
  }, [loadedVideoUrl]);

  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setUserAnswers({});
    setQuizResult(null);
    setQuizError(null);
  }, []);

  useEffect(() => {
    const previousVideoId = previousVideoIdRef.current;
    
    // Save previous session if there was one
    if (previousVideoId && previousVideoId !== videoId) {
      const sessionToSave: VideoSession = {
        insertedLinks,
        notes,
        highlights,
        watchedSeconds: Array.from(playerState.watchedSeconds),
        currentTime: playerState.currentTime,
      };
      setVideoSessions(prev => ({
        ...prev,
        [previousVideoId]: sessionToSave,
      }));
    }

    // Load new session
    const newSession = videoId ? videoSessions[videoId] : null;
    if (newSession) {
      setInsertedLinks(newSession.insertedLinks);
      setNotes(newSession.notes || []); 
      setHighlights(newSession.highlights || []);
      setPlayerState(prev => ({
        ...prev,
        currentTime: newSession.currentTime,
        watchedSeconds: new Set(newSession.watchedSeconds),
        isPlaying: false,
        hasSkipped: false,
        duration: 0,
      }));
    } else {
      // Or reset if no session found
      setInsertedLinks([]);
      setNotes([]);
      setHighlights([]);
      setPlayerState({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        watchedSeconds: new Set(),
        hasSkipped: false,
      });
    }

    resetQuiz();
    previousVideoIdRef.current = videoId;
  }, [videoId, setVideoSessions, resetQuiz]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoId) {
        const sessionToSave: VideoSession = {
          insertedLinks,
          notes,
          highlights,
          watchedSeconds: Array.from(playerState.watchedSeconds),
          currentTime: playerState.currentTime,
        };
        const currentSessions = JSON.parse(localStorage.getItem('studytube-video-sessions') || '{}');
        currentSessions[videoId] = sessionToSave;
        localStorage.setItem('studytube-video-sessions', JSON.stringify(currentSessions));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [videoId, insertedLinks, playerState, notes, highlights]);
  
  const addToHistory = useCallback(async (url: string) => {
    const existingItem = history.find(item => item.url === url);
    if (existingItem) {
        setVideoTitle(existingItem.title);
        setHistory(prev => [existingItem, ...prev.filter(item => item.url !== url)]);
        return;
    }
    
    let title = url;
    try {
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (response.ok) {
            const data = await response.json();
            title = data.title || url;
        }
    } catch (error) {
        console.error("Failed to fetch video title:", error);
    }
    setVideoTitle(title);
    const newHistoryItem: HistoryItem = { url, title };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
  }, [history, setHistory]);
  
  // Restore title on page load from history
  useEffect(() => {
    if (videoId && loadedVideoUrl) {
      const itemInHistory = history.find(item => item.url === loadedVideoUrl);
      if (itemInHistory) {
        setVideoTitle(itemInHistory.title);
      }
    }
  }, [videoId, history, loadedVideoUrl]);

  const loadVideo = (url: string) => {
    setLoadedVideoUrl(url);
    if(url) {
      addToHistory(url);
    }
  };

  const handleProgress = useCallback((state: PlayerState) => {
    setPlayerState(state);
    const watchedPercentage = (state.watchedSeconds.size / state.duration) * 100;
    if (state.duration > 0 && watchedPercentage >= 50 && !state.hasSkipped) {
      const videoPointsKey = `points-awarded-${videoId}`;
      if (!localStorage.getItem(videoPointsKey)) {
        setPoints(p => p + 10);
        localStorage.setItem(videoPointsKey, 'true');
      }
    }
  }, [videoId, setPoints]);

  const onPlayerReady = useCallback((playerInstance: YT.Player) => {
    setPlayer(playerInstance);
    const session = videoSessions[videoId];
    if (session && session.currentTime > 0) {
      playerInstance.seekTo(session.currentTime, true);
    }
  }, [videoSessions, videoId]);

  const handleSendMessage = async (text: string) => {
    if (!chat || isBotTyping) return;
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    // FIX: Corrected typo `setIsBotyping` to `setIsBotTyping`.
    setIsBotTyping(true);
    try {
      const response = await chat.sendMessage({ message: text });
      const botMessage: Message = { id: Date.now().toString() + '-bot', text: response.text, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: Message = { id: Date.now().toString() + '-error', text: 'Sorry, I encountered an error.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // FIX: Corrected typo `setIsBotyping` to `setIsBotTyping`.
      setIsBotTyping(false);
    }
  };
  
  const handleGenerateQuiz = async () => {
    if (!videoTitle) return;
    setIsGeneratingQuiz(true);
    resetQuiz();
    try {
      const allNotes = [...notes, ...highlights];
      const generatedQuiz = await generateQuiz(videoTitle, allNotes);
      setQuiz(generatedQuiz);
    } catch (error: any) {
      console.error(error);
      setQuizError(error.message || 'An unknown error occurred.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setQuizResult(null); // Reset result if user changes an answer
  };

  const handleCheckAnswers = () => {
    if (!quiz) return;
    let score = 0;
    quiz.forEach((item, index) => {
      if (userAnswers[index] === item.correctAnswer) {
        score++;
      }
    });
    setQuizResult({ score, total: quiz.length });
    setPoints(p => p + score * 2); // Award 2 points for each correct answer
  };
  
  const handleLinkTrigger = useCallback((url: string) => {
    setLinkModalUrl(url);
  }, []);

  const handleCloseLinkModal = () => {
    setLinkModalUrl(null);
    player?.playVideo?.();
  };

  const handleOpenLink = () => {
    if (linkModalUrl) {
      window.open(linkModalUrl, '_blank');
    }
    handleCloseLinkModal();
  };


  const seekTo = (time: number) => {
    player?.seekTo(time, true);
  };

  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
  };

  const handlePdfClear = () => {
    setPdfFile(null);
  };

  const pauseVideo = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  const playVideo = useCallback(() => {
    player?.playVideo();
  }, [player]);

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 dark:text-gray-200 dark:bg-black transition-colors duration-300">
      {videoId && (
        <Header 
          history={history}
          onLoadVideo={loadVideo}
          onGoHome={() => loadVideo('')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      <main className="container mx-auto p-4 lg:px-6 lg:pt-6">
        <AnimatePresence mode="wait">
         {!videoId ? (
            <motion.div
              key="main-app-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-24"
            >
              {activeView === 'Home' && <HomePage profile={profile} setProfile={setProfile} homeTodos={homeTodos} setHomeTodos={setHomeTodos} courses={courses} setCourses={setCourses} />}
              {activeView === 'Course' && <CoursesPage onLoadVideo={loadVideo} courses={courses} setCourses={setCourses} />}
              {activeView === 'Schedule' && <SchedulePage schedules={schedules} setSchedules={setSchedules} courses={courses} />}
               <BottomNavBar activeView={activeView} setActiveView={setActiveView} />
            </motion.div>
         ) : (
            <motion.div
              key="player-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-6"
            >
              <div className="md:col-span-3">
                <PlayerSection 
                  videoId={videoId}
                  videoTitle={videoTitle}
                  playerState={playerState}
                  onPlayerReady={onPlayerReady}
                  onProgress={handleProgress}
                  insertedLinks={insertedLinks}
                  onLinkTrigger={handleLinkTrigger}
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-6" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <AnimatePresence>
                  {pdfFileUrl && (
                    <motion.div 
                      className="flex-1 min-h-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
                        <PdfView
                          pdfFileUrl={pdfFileUrl}
                          onPdfUpload={handlePdfUpload}
                          onPdfClear={handlePdfClear}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex-1 min-h-0">
                  <NotesPanel 
                    insertedLinks={insertedLinks}
                    setInsertedLinks={setInsertedLinks}
                    notes={notes}
                    setNotes={setNotes}
                    highlights={highlights}
                    setHighlights={setHighlights}
                    onTimestampClick={seekTo}
                    currentTime={playerState.currentTime}
                    duration={playerState.duration}
                    activeTab={activeNoteTab}
                    setActiveTab={setActiveNoteTab}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isBotTyping={isBotTyping}
                    quiz={quiz}
                    setQuiz={setQuiz}
                    isGeneratingQuiz={isGeneratingQuiz}
                    quizError={quizError}
                    userAnswers={userAnswers}
                    quizResult={quizResult}
                    onGenerateQuiz={handleGenerateQuiz}
                    onAnswerChange={handleAnswerChange}
                    onCheckAnswers={handleCheckAnswers}
                    onResetQuiz={resetQuiz}
                    onPauseVideo={pauseVideo}
                    onPlayVideo={playVideo}
                  />
                </div>
              </div>
            </motion.div>
         )}
         </AnimatePresence>
      </main>
      <Modal
        isOpen={!!linkModalUrl}
        onClose={handleCloseLinkModal}
        title="External Link"
        footer={
            <>
                <button
                  onClick={handleCloseLinkModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Continue Video
                </button>
                <button
                  onClick={handleOpenLink}
                  className="px-4 py-2 text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Open Link
                </button>
            </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
            You've reached a timestamp with an inserted link. What would you like to do?
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md truncate mt-2">
            {linkModalUrl}
        </p>
      </Modal>
    </div>
  );
};

export default App;