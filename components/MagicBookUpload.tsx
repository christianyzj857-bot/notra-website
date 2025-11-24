'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MagicBookUploadProps {
  isOpen: boolean;
  type: "file" | "audio" | "video";
  fileName?: string;
  progress: number; // 0-100
  loadingStep: string;
  onComplete?: (sessionId: string) => void;
  onClose?: () => void;
  notePreview?: {
    title: string;
    subtitle: string;
    overview: string;
    keyConcepts?: string[];
  };
}

export default function MagicBookUpload({
  isOpen,
  type,
  fileName,
  progress,
  loadingStep,
  onComplete,
  onClose,
  notePreview
}: MagicBookUploadProps) {
  const [bookState, setBookState] = useState<'idle' | 'hovering' | 'loading' | 'complete'>('idle');
  const [rightPageScale, setRightPageScale] = useState(1);
  const [showNotes, setShowNotes] = useState(false);

  // Update book state based on progress
  useEffect(() => {
    if (!isOpen) {
      setBookState('idle');
      setRightPageScale(1);
      setShowNotes(false);
      return;
    }

    if (progress === 0) {
      setBookState('loading');
    } else if (progress >= 100) {
      // Complete state - scale up right page and show notes
      setTimeout(() => {
        setRightPageScale(1.5);
        setTimeout(() => {
          setShowNotes(true);
          setBookState('complete');
        }, 300);
      }, 500);
    } else {
      setBookState('loading');
    }
  }, [isOpen, progress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-5xl p-8">
        {/* Magic Book Container */}
        <div className="relative flex items-center justify-center perspective-1000" style={{ perspective: '1000px' }}>
          {/* Glow Effect Behind Book */}
          <div
            className={`absolute inset-0 blur-3xl transition-all duration-500 ${
              bookState === 'idle'
                ? 'bg-indigo-200/0'
                : bookState === 'hovering'
                ? 'bg-indigo-400/30'
                : bookState === 'loading'
                ? 'bg-purple-500/50 animate-pulse'
                : bookState === 'complete'
                ? 'bg-green-400/40'
                : 'bg-indigo-500/60 animate-pulse'
            }`}
            style={{
              transform: `scale(${bookState === 'loading' ? 1.1 : 1})`,
              transition: 'all 0.3s ease-out'
            }}
          />

          {/* Open Book Container - 3D Effect */}
          <div
            className={`
              relative w-full max-w-4xl h-[500px] md:h-[600px]
              transition-all duration-500
              ${bookState === 'loading' ? 'animate-pulse' : ''}
            `}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Left Page */}
            <div
              className={`
                absolute left-0 top-0 w-1/2 h-full
                bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/30
                rounded-l-3xl border-2 border-r-0
                transition-all duration-500
                border-slate-200/50
              `}
              style={{
                transform: `perspective(1000px) rotateY(${bookState === 'loading' ? '-5deg' : '0deg'})`,
                transformOrigin: 'right center',
                boxShadow: bookState !== 'idle'
                  ? `-10px 0 30px rgba(139, 92, 246, 0.3), inset -5px 0 10px rgba(0, 0, 0, 0.1)`
                  : 'inset -5px 0 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Page Texture - Left */}
              <div className="absolute inset-0 overflow-hidden rounded-l-3xl">
                {/* Page lines */}
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute left-8 right-4 h-px transition-all duration-300 ${
                      bookState === 'loading' ? 'bg-indigo-300/20 animate-pulse' : 'bg-slate-300/30'
                    }`}
                    style={{
                      top: `${5 + i * 3.5}%`,
                      opacity: bookState === 'idle' ? 0.2 : 0.6,
                      transform: bookState === 'loading' ? `translateX(${Math.sin(i * 0.5) * 3}px)` : 'none'
                    }}
                  />
                ))}

                {/* Decorative corner ornament */}
                <div className="absolute top-8 left-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
              </div>

              {/* Left Page Content - Old Notes */}
              <div className="relative h-full p-6 overflow-hidden z-10">
                <div className="absolute inset-0 p-4 space-y-3 opacity-60">
                  {/* Random text snippets */}
                  {[
                    { text: 'Old notes...', top: '10%', left: '10%', rotate: '-2deg' },
                    { text: 'Messy scribbles', top: '25%', left: '15%', rotate: '1deg' },
                    { text: 'Incomplete thoughts', top: '40%', left: '8%', rotate: '-1deg' },
                    { text: '???', top: '55%', left: '12%', rotate: '2deg', style: 'font-bold' },
                    { text: 'Need to organize...', top: '70%', left: '10%', rotate: '-1.5deg' },
                  ].map((note, i) => (
                    <div
                      key={i}
                      className={`absolute text-xs text-slate-600 ${note.style || ''} font-mono`}
                      style={{
                        top: note.top,
                        left: note.left,
                        transform: `rotate(${note.rotate})`,
                        opacity: 0.4,
                      }}
                    >
                      {note.text}
                    </div>
                  ))}

                  {/* Coffee stain */}
                  <div
                    className="absolute rounded-full bg-amber-700/10 blur-xl"
                    style={{
                      top: '60%',
                      left: '20%',
                      width: '80px',
                      height: '80px',
                    }}
                  />
                </div>

                <div className="relative z-10 mt-4">
                  <p className="text-sm font-semibold text-slate-500 italic">
                    Old messy notes...
                  </p>
                </div>
              </div>
            </div>

            {/* Book Spine (Center) */}
            <div
              className={`
                absolute left-1/2 top-0 w-2 h-full -translate-x-1/2
                bg-gradient-to-b from-slate-700 via-indigo-800 to-purple-800
                transition-all duration-500
                ${bookState !== 'idle' ? 'shadow-lg' : ''}
              `}
              style={{
                boxShadow: bookState !== 'idle'
                  ? `0 0 20px rgba(139, 92, 246, 0.5), inset -2px 0 10px rgba(0, 0, 0, 0.3)`
                  : 'inset -2px 0 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Spine decorative lines */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-indigo-600/30"
                  style={{
                    top: `${10 + i * 10}%`,
                  }}
                />
              ))}
            </div>

            {/* Right Page */}
            <div
              className={`
                absolute right-0 top-0 w-1/2 h-full
                bg-gradient-to-bl from-slate-50 via-indigo-50/50 to-purple-50/30
                rounded-r-3xl border-2 border-l-0
                transition-all duration-500
                border-slate-200/50
              `}
              style={{
                transform: `perspective(1000px) rotateY(${bookState === 'loading' ? '5deg' : '0deg'})`,
                transformOrigin: 'left center',
                boxShadow: bookState !== 'idle'
                  ? `10px 0 30px rgba(139, 92, 246, 0.3), inset 5px 0 10px rgba(0, 0, 0, 0.1)`
                  : 'inset 5px 0 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Page Texture - Right */}
              <div className="absolute inset-0 overflow-hidden rounded-r-3xl">
                {/* Page lines */}
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute left-4 right-8 h-px transition-all duration-300 ${
                      bookState === 'loading' ? 'bg-indigo-300/20 animate-pulse' : 'bg-slate-300/30'
                    }`}
                    style={{
                      top: `${5 + i * 3.5}%`,
                      opacity: bookState === 'idle' ? 0.2 : 0.6,
                      transform: bookState === 'loading' ? `translateX(${Math.sin(i * 0.5) * -3}px)` : 'none'
                    }}
                  />
                ))}

                {/* Decorative corner ornament */}
                <div className="absolute top-8 right-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
              </div>

              {/* Right Page Content - Loading / Notes */}
              <div
                className="relative h-full overflow-hidden z-10 transition-all duration-1000"
                style={{
                  transform: `scale(${rightPageScale})`,
                  transformOrigin: 'center center',
                }}
              >
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
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full shadow-lg"
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

                {showNotes && notePreview && (
                  <div className="h-full overflow-y-auto p-6 text-left animate-in fade-in slide-in-from-bottom-4">
                    {/* Note content preview */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {notePreview.title}
                      </h2>
                      <p className="text-lg text-slate-600">{notePreview.subtitle}</p>
                    </div>

                    {/* Overview */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Overview</h3>
                      <p className="text-base text-slate-700 leading-relaxed">
                        {notePreview.overview}
                      </p>
                    </div>

                    {/* Key Concepts */}
                    {notePreview.keyConcepts && notePreview.keyConcepts.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Key Concepts</h3>
                        <div className="space-y-2">
                          {notePreview.keyConcepts.map((concept: string, idx: number) => (
                            <div key={idx} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                              <p className="text-sm font-semibold text-slate-800">{concept}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Full Notes button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => {
                          if (onComplete) {
                            // Session ID would be passed from parent
                            onComplete('session-id-placeholder');
                          }
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg"
                      >
                        View Full Notes
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Magic Particles Overlay */}
            {bookState !== 'idle' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full bg-indigo-400 ${
                      bookState === 'loading' ? 'animate-ping' : ''
                    }`}
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
