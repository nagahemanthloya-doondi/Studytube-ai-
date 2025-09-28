
import React from 'react';
import type { PlayerState, InsertedLink } from '../types';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';

interface VideoPlayerProps {
  videoId: string;
  onPlayerReady: (player: YT.Player) => void;
  onProgress: (state: PlayerState) => void;
  insertedLinks: InsertedLink[];
  onLinkTrigger: (url: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onPlayerReady, onProgress, insertedLinks, onLinkTrigger }) => {
  useYouTubePlayer(videoId, onPlayerReady, onProgress, insertedLinks, onLinkTrigger);

  return (
    <div className="bg-black rounded-md w-full h-full">
      {videoId ? (
        <div id="youtube-player" className="w-full h-full"></div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Please enter a valid YouTube URL to begin.</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
