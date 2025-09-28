
import { useState, useEffect, useRef } from 'react';
import type { PlayerState, InsertedLink } from '../types';

export const useYouTubePlayer = (
  videoId: string,
  onPlayerReady: (player: YT.Player) => void,
  onProgress: (state: PlayerState) => void,
  insertedLinks: InsertedLink[],
  onLinkTrigger: (url: string) => void
) => {
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    watchedSeconds: new Set(),
    hasSkipped: false,
  });

  const resetLinksTriggerState = () => {
    insertedLinks.forEach(link => link.triggered = false);
  };

  useEffect(() => {
    if (!videoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      return;
    }

    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
       resetLinksTriggerState();
       playerRef.current = new YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'autoplay': 0,
            'controls': 1,
        },
        events: {
          'onReady': (event) => {
            onPlayerReady(event.target);
          },
          'onStateChange': onPlayerStateChange,
        },
      });
    };
    
    if (window.YT) {
        createPlayer();
    } else {
        const checkYT = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkYT);
                createPlayer();
            }
        }, 100);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Don't destroy player here, let the new videoId effect handle it
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, onPlayerReady]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.PLAYING) {
      const duration = playerRef.current?.getDuration() || 0;
      setPlayerState(prev => ({...prev, isPlaying: true, duration}));
      lastTimeRef.current = playerRef.current?.getCurrentTime() || 0;
      
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      progressIntervalRef.current = window.setInterval(() => {
        const player = playerRef.current;
        if (!player) return;
        
        const currentTime = player.getCurrentTime();
        const newWatchedSeconds = new Set(playerState.watchedSeconds);
        
        // Check for skipping
        const timeDiff = currentTime - lastTimeRef.current;
        if (timeDiff > 2) { // Allow for small buffering jumps
            setPlayerState(prev => ({...prev, hasSkipped: true }));
        }
        
        // Add watched seconds
        for (let i = Math.floor(lastTimeRef.current); i < Math.floor(currentTime); i++) {
            newWatchedSeconds.add(i);
        }

        const newState = {
            ...playerState,
            currentTime: currentTime,
            duration: player.getDuration(),
            isPlaying: true,
            watchedSeconds: newWatchedSeconds
        };
        setPlayerState(newState);
        onProgress(newState);

        // Check for inserted links
        insertedLinks.forEach(link => {
            if (!link.triggered && currentTime >= link.time && currentTime < link.time + 1.5) {
                player.pauseVideo();
                onLinkTrigger(link.url);
                link.triggered = true; // Mark as triggered to prevent re-opening
            }
        });
        
        lastTimeRef.current = currentTime;

      }, 500);
    } else {
      setPlayerState(prev => ({...prev, isPlaying: false}));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };
  
  return { playerState };
};
