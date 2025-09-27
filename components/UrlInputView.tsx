import React, { useState } from 'react';

interface UrlInputViewProps {
  onLoadVideo: (url: string) => void;
}

const UrlInputView: React.FC<UrlInputViewProps> = ({ onLoadVideo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onLoadVideo(url.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <div className="w-full max-w-2xl text-center">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here to start studying..."
            className="w-full px-4 py-3 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900"
          >
            Load Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default UrlInputView;
