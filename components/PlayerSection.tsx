import React from 'react';
import VideoPlayer from './VideoPlayer';
import ProgressBar from './ProgressBar';
import type { PlayerState, InsertedLink } from '../types';

interface PlayerSectionProps {
    videoId: string;
    videoTitle: string;
    playerState: PlayerState;
    onPlayerReady: (player: YT.Player) => void;
    onProgress: (state: PlayerState) => void;
    insertedLinks: InsertedLink[];
    onHighlightClick: () => void;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
    videoId,
    videoTitle,
    playerState,
    onPlayerReady,
    onProgress,
    insertedLinks,
    onHighlightClick,
}) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col h-full">
            <div className="aspect-video w-full bg-black rounded-md flex-shrink-0">
                <VideoPlayer 
                    videoId={videoId} 
                    onPlayerReady={onPlayerReady}
                    onProgress={onProgress}
                    insertedLinks={insertedLinks}
                />
            </div>
            <div className="pt-4 flex flex-col flex-grow">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate" title={videoTitle}>
                    {videoTitle}
                 </h2>
                 <div className="w-full">
                    <ProgressBar 
                        currentTime={playerState.currentTime} 
                        duration={playerState.duration}
                    />
                 </div>
                 <div className="mt-auto pt-4 flex items-center gap-2">
                     <button 
                        onClick={onHighlightClick}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 transition-all active:scale-95"
                     >
                        Add Highlight
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default PlayerSection;