'use client';

import React, { useState, useRef } from 'react';

interface ResumeUploadProps {
  currentResumeUrl?: string;
  publicResumeUrl?: string;
  generatedResumeUrl?: string;
  onUpload: (file: File) => void;
  onExtract: () => void;
  onGenerate: () => void;
  isExtracting?: boolean;
  isGenerating?: boolean;
  isUploading?: boolean;
}

export default function ResumeUpload({
  currentResumeUrl,
  publicResumeUrl,
  generatedResumeUrl,
  onUpload,
  onExtract,
  onGenerate,
  isExtracting = false,
  isGenerating = false,
  isUploading = false,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="card-premium mb-8">
      <h2 className="text-base font-bold text-text-darkest mb-6">Resume</h2>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border-muted bg-surface-secondary hover:border-accent/50 hover:bg-accent/5'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
        />
        
        {publicResumeUrl ? (
          <div className="flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <p className="text-sm font-bold text-text-darkest mb-1">Resume Uploaded</p>
            {publicResumeUrl ? (
              <div className="flex flex-col items-center gap-2">
                <a 
                  href={publicResumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#F1EEFE] hover:bg-[#E8E4FE] text-[#7C5CFC] text-sm font-bold rounded-xl transition-all border border-[#DED6FE] shadow-sm active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  View Uploaded
                </a>
                {generatedResumeUrl && (
                  <a 
                    href={generatedResumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#F1EEFE] hover:bg-[#E8E4FE] text-[#7C5CFC] text-sm font-bold rounded-xl transition-all border border-[#DED6FE] shadow-sm active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    View Generated
                  </a>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-orange-500 font-bold italic animate-pulse">
                URL missing - please re-upload
              </span>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-[10px] text-text-muted hover:text-accent uppercase tracking-wider font-bold"
            >
              Replace File
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
              {isUploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </div>
            
            <div className="mb-2">
              {isUploading ? (
                <span className="text-accent font-semibold">Uploading...</span>
              ) : (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent font-semibold hover:underline"
                  >
                    Click to upload
                  </button>
                  <span className="text-text-secondary"> or drag and drop</span>
                </>
              )}
            </div>
            <p className="text-xs text-text-muted">PDF only (max. 10MB)</p>
          </>
        )}
      </div>

      {currentResumeUrl && (
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onExtract}
            disabled={isExtracting}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white text-sm font-bold rounded-full transition-all shadow-sm active:scale-[0.98]"
          >
            {isExtracting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            )}
            Extract from Resume
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white text-sm font-bold rounded-full transition-all shadow-sm active:scale-[0.98]"
          >
             {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            )}
            Generate Resume from Profile
          </button>
        </div>
      )}
    </div>
  );
}
