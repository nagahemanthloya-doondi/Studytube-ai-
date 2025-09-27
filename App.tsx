import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Timestamp, InsertedLink, Theme, PlayerState, Message, HistoryItem, VideoSession } from './types';
import { Chat } from '@google/genai';
import { getGeminiChat } from './services/geminiService';
import Header from './components/Header';
import UrlInputView from './components/UrlInputView';
import PlayerSection from './components/PlayerSection';
import NotesPanel from './components/NotesPanel';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('studytube-theme', 'light');
  const [loadedVideoUrl, setLoadedVideoUrl] = useLocalStorage<string>('studytube-url', '');
  const [points, setPoints] = useLocalStorage<number>('studytube-points', 0);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('studytube-history', []);
  const [videoSessions, setVideoSessions] = useLocalStorage<Record<string, VideoSession>>('studytube-video-sessions', {});

  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [insertedLinks, setInsertedLinks] = useState<InsertedLink[]>([]);
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
  const [activeNoteTab, setActiveNoteTab] = useState('Highlights');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  
  const previousVideoIdRef = useRef<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocusMode]);

  useEffect(() => {
    setChat(getGeminiChat());
  }, []);
  
  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
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

  useEffect(() => {
    const previousVideoId = previousVideoIdRef.current;
    
    // Save previous session if there was one
    if (previousVideoId && previousVideoId !== videoId) {
      const sessionToSave: VideoSession = {
        timestamps,
        insertedLinks,
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
      setTimestamps(newSession.timestamps);
      setInsertedLinks(newSession.insertedLinks);
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
      setTimestamps([]);
      setInsertedLinks([]);
      setPlayerState({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        watchedSeconds: new Set(),
        hasSkipped: false,
      });
    }

    previousVideoIdRef.current = videoId;
  }, [videoId, setVideoSessions]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoId) {
        const sessionToSave: VideoSession = {
          timestamps,
          insertedLinks,
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
  }, [videoId, timestamps, insertedLinks, playerState]);
  
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
      setIsBotTyping(false);
    }
  };
  
  const handlePdfUpload = (file: File) => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }
    
    const url = URL.createObjectURL(file);
    setPdfFileUrl(url);
    pdfUrlRef.current = url;
    setActiveNoteTab('PDF');
  };

  const handlePdfClear = () => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }
    setPdfFileUrl(null);
    pdfUrlRef.current = null;
  };

  const seekTo = (time: number) => {
    player?.seekTo(time, true);
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white dark:text-gray-200 dark:bg-gray-950 transition-colors duration-300">
      <Header 
        history={history}
        onLoadVideo={loadVideo}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(p => !p)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="container mx-auto p-4 lg:p-6">
        <AnimatePresence mode="wait">
         {!videoId ? (
            <motion.div
              key="url-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <UrlInputView onLoadVideo={loadVideo} />
            </motion.div>
         ) : (
            <motion.div
              key="player-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <div className="lg:col-span-2">
                    <PlayerSection 
                        videoId={videoId}
                        videoTitle={videoTitle}
                        playerState={playerState}
                        onPlayerReady={onPlayerReady}
                        onProgress={handleProgress}
                        insertedLinks={insertedLinks}
                        onHighlightClick={() => setActiveNoteTab('Highlights')}
                    />
                </div>
                <div className="lg:col-span-1 max-h-[calc(100vh-120px)]">
                    <NotesPanel 
                        timestamps={timestamps}
                        setTimestamps={setTimestamps}
                        onTimestampClick={seekTo}
                        currentTime={playerState.currentTime}
                        activeTab={activeNoteTab}
                        setActiveTab={setActiveNoteTab}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isBotTyping={isBotTyping}
                        pdfFileUrl={pdfFileUrl}
                        onPdfUpload={handlePdfUpload}
                        onPdfClear={handlePdfClear}
                    />
                </div>
            </motion.div>
         )}
         </AnimatePresence>
      </main>
    </div>
  );
};

export default App;