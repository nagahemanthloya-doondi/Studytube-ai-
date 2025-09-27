export interface Timestamp {
  time: number;
  description: string;
}

export interface InsertedLink {
  id: string;
  time: number;
  url: string;
  triggered: boolean;
}

export type Theme = 'light' | 'dark';

export interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  watchedSeconds: Set<number>;
  hasSkipped: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface HistoryItem {
  url: string;
  title: string;
}

export interface VideoSession {
  timestamps: Timestamp[];
  insertedLinks: InsertedLink[];
  watchedSeconds: number[];
  currentTime: number;
}


// FIX: Add global type declarations for the YouTube Iframe Player API.
// This resolves TypeScript errors about the 'YT' namespace not being found
// across multiple components that interact with the YouTube player.
declare global {
  // FIX: Replaced separate namespace and var declarations with a single namespace
  // containing a Player class. This resolves "Duplicate identifier" errors and correctly
  // types the YT.Player constructor for use with `new YT.Player(...)`.
  namespace YT {
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface PlayerOptions {
      videoId?: string;
      playerVars?: {
        playsinline?: 0 | 1;
        autoplay?: 0 | 1;
        controls?: 0 | 1 | 2;
        [key: string]: any;
      };
      events?: {
        onReady?: (event: { target: Player }) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
      };
    }

    interface OnStateChangeEvent {
      data: PlayerState;
      target: Player;
    }

    // The Player class provides both the instance type and the constructor type.
    class Player {
      constructor(elementId: string, options: PlayerOptions);
      destroy(): void;
      getDuration(): number;
      getCurrentTime(): number;
      pauseVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getPlayerState(): PlayerState;
    }
  }

  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: typeof YT;
  }
}
