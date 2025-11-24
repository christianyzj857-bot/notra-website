'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface MagicBookUploadProps {
  isOpen: boolean;
  type: "file" | "audio" | "video";
  fileName?: string;
  progress: number; // 0-100
  loadingStep: string;
  onComplete: (sessionId: string) => void;
  onClose: () => void;
  error?: string | null;
}

export default function MagicBookUpload({
  isOpen,
  type,
  fileName,
  progress,
  loadingStep,
  onComplete,
  onClose,
  error
}: MagicBookUploadProps) {
  const [bookState, setBookState] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
  const [rightPageScale, setRightPageScale] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (progress === 0) {
      setBookState('idle');
    } else if (progress > 0 && progress < 100) {
      setBookState('loading');
    } else if (progress === 100 && !error) {
      setBookState('complete');
      // Start scale animation
      setTimeout(() => {
        setRightPageScale(1.5);
        setTimeout(() => {
          setShowPreview(true);
        }, 300);
      }, 500);
    } else if (error) {
      setBookState('error');
    }
  }, [progress, error]);

  if (!isOpen) return null;

  const getTypeEmoji = () => {
    switch (type) {
      case "file": return "📄";
      case "audio": return "🎤";
      case "video": return "🎥";
      default: return "📖";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "file": return "from-blue-500 to-indigo-600";
      case "audio": return "from-purple-500 to-pink-600";
      case "video": return "from-pink-500 to-rose-600";
      default: return "from-indigo-500 to-purple-600";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl mx-4">
        {/* Close button */}
        {(bookState === 'complete' || bookState === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Magic Book Container */}
        <div className="relative w-full h-[600px] perspective-1000" style={{ perspective: '1000px' }}>
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 blur-3xl transition-all duration-500 ${
              bookState === 'idle'
                ? 'bg-indigo-200/0'
                : bookState === 'loading'
                ? 'bg-purple-500/50 animate-pulse'
                : bookState === 'complete'
                ? 'bg-green-400/40'
                : 'bg-red-400/40'
            }`}
          />

          {/* Open Book */}
          <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
            {/* Left Page - Messy Notes */}
            <div
              className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/30 rounded-l-3xl border-2 border-r-0 border-slate-200/50"
              style={{
                transform: `perspective(1000px) rotateY(${bookState === 'loading' ? '-5deg' : '0deg'})`,
                transformOrigin: 'right center',
                boxShadow: 'inset -5px 0 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Page lines */}
              <div className="absolute inset-0 overflow-hidden rounded-l-3xl">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-8 right-4 h-px bg-slate-300/30"
                    style={{ top: `${5 + i * 3.5}%` }}
                  />
                ))}
              </div>

              {/* Messy content */}
              <div className="relative h-full p-8 overflow-hidden">
                <p className="text-sm font-semibold text-slate-500 italic">
                  Old messy notes...
                </p>
                <div className="mt-4 space-y-2 opacity-40">
                  <p className="text-xs text-slate-600">f(x) = x² + 3x - 2</p>
                  <p className="text-xs text-slate-600">Derivative: 2x + 3</p>
                  <p className="text-xs text-slate-600">∫ x dx = x²/2 + C</p>
                </div>
              </div>
            </div>

            {/* Book Spine */}
            <div
              className="absolute left-1/2 top-0 w-2 h-full -translate-x-1/2 bg-gradient-to-b from-slate-700 via-indigo-800 to-purple-800"
              style={{ boxShadow: 'inset -2px 0 10px rgba(0, 0, 0, 0.3)' }}
            />

            {/* Right Page - Dynamic Content */}
            <div
              className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-bl from-slate-50 via-indigo-50/50 to-purple-50/30 rounded-r-3xl border-2 border-l-0 border-slate-200/50"
              style={{
                transform: `perspective(1000px) rotateY(${bookState === 'loading' ? '5deg' : '0deg'})`,
                transformOrigin: 'left center',
                boxShadow: 'inset 5px 0 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Page lines */}
              <div className="absolute inset-0 overflow-hidden rounded-r-3xl">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-4 right-8 h-px bg-slate-300/30"
                    style={{ top: `${5 + i * 3.5}%` }}
                  />
                ))}
              </div>

              {/* Right Page Content */}
              <div
                className="relative h-full overflow-hidden z-10 transition-all duration-1000"
                style={{
                  transform: `scale(${rightPageScale})`,
                  transformOrigin: 'center center',
                }}
              >
                {bookState === 'idle' && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                      <div className="text-6xl mb-4">{getTypeEmoji()}</div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                      Processing {type}...
                    </h2>
                    <p className="text-lg text-slate-600">
                      {fileName || 'Your content'}
                    </p>
                  </div>
                )}

                {bookState === 'loading' && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    {/* Magic loading animation */}
                    <div className="mb-8 relative">
                      <div className="w-24 h-24 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-purple-500 animate-pulse" />
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-xs mb-4">
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeColor()} transition-all duration-300 ease-out rounded-full shadow-lg`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-2xl font-semibold text-indigo-600 mb-2">
                      {progress}%
                    </p>

                    <p className="text-lg text-slate-600 font-medium animate-pulse">
                      {loadingStep}
                    </p>

                    {/* Magic particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random()}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {bookState === 'complete' && showPreview && (
                  <div className="h-full overflow-y-auto p-8 text-left animate-in fade-in slide-in-from-bottom-4">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">{getTypeEmoji()}</div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Notes Generated!
                          </h2>
                          <p className="text-sm text-slate-600">{fileName}</p>
                        </div>
                      </div>

                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                        <p className="text-green-800 font-semibold flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Your structured notes are ready!
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                          Complete with sections, quizzes, and flashcards.
                        </p>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => {/* Will be handled by parent */}}
                          className={`w-full px-8 py-3 bg-gradient-to-r ${getTypeColor()} text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg`}
                        >
                          View Full Notes
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {bookState === 'error' && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                      <div className="text-6xl mb-4">❌</div>
                    </div>
                    <h2 className="text-3xl font-bold text-red-800 mb-4">
                      Processing Failed
                    </h2>
                    <p className="text-lg text-red-600 mb-6">
                      {error || 'An error occurred while processing your content.'}
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Magic Particles Overlay */}
            {bookState === 'loading' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
