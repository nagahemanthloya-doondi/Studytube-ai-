
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

export interface TimestampedNote {
  id: string;
  time: number;
  content: string;
}

export interface VideoSession {
  insertedLinks: InsertedLink[];
  watchedSeconds: number[];
  currentTime: number;
  timestampedNotes: TimestampedNote[];
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface CourseFile {
  id: string;
  name: string;
  type: 'pdf' | 'pptx' | 'docx' | 'other';
  mimeType: string;
  dataUrl: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CourseLink {
  id: string;
  title: string;
  url: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface StudySet {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  location: string;
  color: string;
  files: CourseFile[];
  todos: TodoItem[];
  links: CourseLink[];
  studySets: StudySet[];
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
      playVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getPlayerState(): PlayerState;
    }
  }

  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: typeof YT;
  }
}