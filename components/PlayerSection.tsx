
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
    onLinkTrigger: (url: string) => void;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
    videoId,
    videoTitle,
    playerState,
    onPlayerReady,
    onProgress,
    insertedLinks,
    onLinkTrigger,
}) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col h-full">
            <div className="aspect-video w-full bg-black rounded-md flex-shrink-0">
                <VideoPlayer 
                    videoId={videoId} 
                    onPlayerReady={onPlayerReady}
                    onProgress={onProgress}
                    insertedLinks={insertedLinks}
                    onLinkTrigger={onLinkTrigger}
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
                 </div>
            </div>
        </div>
    );
};

export default PlayerSection;
