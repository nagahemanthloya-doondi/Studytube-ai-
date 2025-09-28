
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface PdfViewProps {
  pdfFileUrl: string | null;
  onPdfUpload: (file: File) => void;
  onPdfClear: () => void;
}

const PdfView: React.FC<PdfViewProps> = ({ pdfFileUrl, onPdfUpload, onPdfClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPdfUpload(file);
    }
  };

  if (pdfFileUrl) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
            <button
                onClick={onPdfClear}
                className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-200 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
                Clear PDF
            </button>
        </div>
        <div className="flex-grow min-h-0 bg-gray-200 dark:bg-gray-800">
          <object 
            data={pdfFileUrl} 
            type="application/pdf"
            width="100%" 
            height="100%" 
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-gray-700 dark:text-gray-300 mb-4">Your browser does not support embedding PDFs.</p>
                <a 
                    href={pdfFileUrl} 
                    download
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    Download PDF
                </a>
            </div>
          </object>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No PDF loaded</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload a PDF to view it alongside the video.</p>
        <div className="mt-6">
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800"
            >
              Upload PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default PdfView;
