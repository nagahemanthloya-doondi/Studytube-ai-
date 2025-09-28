
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

  // Use refs to hold the latest callbacks and props to avoid stale closures
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const onLinkTriggerRef = useRef(onLinkTrigger);
  onLinkTriggerRef.current = onLinkTrigger;
  
  const insertedLinksRef = useRef(insertedLinks);
  insertedLinksRef.current = insertedLinks;

  // State to manage link triggers internally to prevent re-triggering
  const triggeredLinkIds = useRef(new Set<string>());

  useEffect(() => {
    if (!videoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      return;
    }

    const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
      const player = playerRef.current;
      if (!player) return;

      if (event.data === YT.PlayerState.PLAYING) {
        lastTimeRef.current = player.getCurrentTime();
        
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  
        progressIntervalRef.current = window.setInterval(() => {
          setPlayerState(prev => {
            const player = playerRef.current;
            if (!player) return prev;
            
            const currentTime = player.getCurrentTime();
            const newWatchedSeconds = new Set(prev.watchedSeconds);
            
            const timeDiff = currentTime - lastTimeRef.current;
            const hasSkipped = prev.hasSkipped || (timeDiff > 2);
            
            for (let i = Math.floor(lastTimeRef.current); i < Math.floor(currentTime); i++) {
                newWatchedSeconds.add(i);
            }
    
            const newState = {
                ...prev,
                currentTime,
                duration: player.getDuration(),
                isPlaying: true,
                watchedSeconds: newWatchedSeconds,
                hasSkipped: hasSkipped,
            };
            onProgressRef.current(newState);
    
            insertedLinksRef.current.forEach(link => {
                if (!triggeredLinkIds.current.has(link.id) && currentTime >= link.time && currentTime < link.time + 1.5) {
                    player.pauseVideo();
                    onLinkTriggerRef.current(link.url);
                    triggeredLinkIds.current.add(link.id);
                }
            });
            
            lastTimeRef.current = currentTime;
            return newState;
          });
        }, 500);

      } else { // Handle PAUSED, ENDED, etc.
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        // Use a functional update to get the latest state and ensure current time is updated on pause
        setPlayerState(prev => {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          
          // Only update if something has changed to avoid unnecessary re-renders
          if (prev.isPlaying === false && prev.currentTime === currentTime) {
            return prev;
          }

          const newState = {
              ...prev,
              currentTime,
              duration: duration || prev.duration,
              isPlaying: false,
          };
          onProgressRef.current(newState);
          return newState;
        });
      }
    };

    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      triggeredLinkIds.current.clear(); // Reset triggered links for new video
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
            // Manually trigger a state update on ready to get initial time/duration
            setPlayerState(prev => {
              const newState = {
                ...prev,
                duration: event.target.getDuration()
              };
              onProgressRef.current(newState);
              return newState;
            });
          },
          'onStateChange': onPlayerStateChange,
        },
      });
    };
    
    if (window.YT && window.YT.Player) {
        createPlayer();
    } else {
        window.onYouTubeIframeAPIReady = createPlayer;
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId, onPlayerReady]);
};
