'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Youtube, Mic, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { ONBOARDING_SAMPLES } from '@/sample-data/onboardingSamples';
import { type OnboardingRole } from '@/types/notra';

export default function OnboardingStep2() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingSample, setIsDraggingSample] = useState(false);
  const [hasDroppedSample, setHasDroppedSample] = useState(false);
  const [showClickHint, setShowClickHint] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [sampleFile, setSampleFile] = useState(ONBOARDING_SAMPLES.find(s => s.role === 'other')?.file || ONBOARDING_SAMPLES[0].file);
  const [bookState, setBookState] = useState<'idle' | 'hovering' | 'feeding' | 'digesting' | 'complete'>('idle');
  const [bookGlow, setBookGlow] = useState(0);

  // Check if user came from step2-location and get role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole;
      const country = localStorage.getItem('onboarding_country');
      
      // Must have completed step1 and step2-country
      if (!stage) {
        window.location.href = '/onboarding/step1';
        return;
      }
      
      // Set default language to English if not set
      if (!localStorage.getItem('ui_language')) {
        localStorage.setItem('ui_language', 'en');
      }
      if (!localStorage.getItem('onboarding_content_language')) {
        localStorage.setItem('onboarding_content_language', 'en');
      }
      
      // Check country is set
      if (!country) {
        // If missing, go back to step2-country (country selection)
        window.location.href = '/onboarding/step2-country';
        return;
      }
      
      setOnboardingRole(stage as OnboardingRole);
      
      // Use sample mapping to get the correct sample for this role
      const sample = ONBOARDING_SAMPLES.find(s => s.role === stage) || 
                     ONBOARDING_SAMPLES.find(s => s.role === 'other') || 
                     ONBOARDING_SAMPLES[0];
      
      if (sample) {
        setSampleFile(sample.file);
      }
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setBookState('hovering');
    setBookGlow(100);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setBookState('idle');
    setBookGlow(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Check if this is the sample file being dragged
    const draggedData = e.dataTransfer.getData('text/plain');
    const isSampleFile = draggedData === `sample-file-${onboardingRole}` || draggedData.includes('sample-file');
    
    if (!isSampleFile) {
      // User tried to drop their own file - ignore it completely
      setBookState('idle');
      setBookGlow(0);
      return;
    }
    
    // Magic book feeding animation sequence
    setBookState('feeding');
    setBookGlow(150);
    setHasDroppedSample(true);
    
    // Store file info and sample data immediately (before navigation)
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_file_name', sampleFile.title);
      localStorage.setItem('onboarding_file_type', 'application/pdf');
      
      // Store the full sample bundle for later use in notes/quiz/flashcards
      const sampleBundle = ONBOARDING_SAMPLES.find(s => s.role === onboardingRole) || 
                          ONBOARDING_SAMPLES.find(s => s.role === 'other') || 
                          ONBOARDING_SAMPLES[0];
      if (sampleBundle) {
        localStorage.setItem('onboarding_sample_data', JSON.stringify(sampleBundle));
      }
    }
    
    // Show digesting animation, then navigate
    setTimeout(() => {
      setBookState('digesting');
      setTimeout(() => {
        setBookState('complete');
        setTimeout(() => {
          window.location.href = '/onboarding/step3';
        }, 500);
      }, 800);
    }, 600);
  };

  // Disable file input - users cannot upload their own files
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent user file uploads
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSampleFileUpload = () => {
    // Store file info and sample data temporarily (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_file_name', sampleFile.title);
      localStorage.setItem('onboarding_file_type', 'application/pdf');
      
      // Store the full sample bundle for later use in notes/quiz/flashcards
      const sampleBundle = ONBOARDING_SAMPLES.find(s => s.role === onboardingRole) || 
                          ONBOARDING_SAMPLES.find(s => s.role === 'other') || 
                          ONBOARDING_SAMPLES[0];
      localStorage.setItem('onboarding_sample_data', JSON.stringify(sampleBundle));
    }
    
    // Navigate to Step 3 after a brief delay
    setTimeout(() => {
      window.location.href = '/onboarding/step3';
    }, 300);
  };

  const handleSampleDragStart = (e: React.DragEvent) => {
    setIsDraggingSample(true);
    e.dataTransfer.effectAllowed = 'move';
    // Mark this as the sample file with role identifier
    e.dataTransfer.setData('text/plain', `sample-file-${onboardingRole}`);
  };

  const handleSampleDragEnd = () => {
    setIsDraggingSample(false);
    // Only reset if not in feeding/digesting state
    if (bookState === 'hovering' || bookState === 'idle') {
      setBookState('idle');
      setBookGlow(0);
    }
  };

  const handleSampleClick = (e: React.MouseEvent) => {
    // Prevent any navigation or upload on click - ONLY drag is allowed
    e.preventDefault();
    e.stopPropagation();
    
    // Click only shows hint and animation, NEVER uploads or navigates
    setShowClickHint(true);
    
    // Add shake animation to indicate "wrong action"
    const card = document.getElementById('sample-file-card');
    if (card) {
      // Remove any existing animation classes
      card.classList.remove('animate-bounce');
      // Add shake effect
      card.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        card.style.animation = '';
      }, 500);
    }
    
    // Hide hint after 3 seconds
    setTimeout(() => {
      setShowClickHint(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Feed the Magic Book
          </h1>
          <p className="text-xl text-slate-600 flex items-center justify-center gap-3">
            <FileText className="w-5 h-5" />
            PDFs
            <span className="text-slate-400">•</span>
            <Youtube className="w-5 h-5" />
            YouTube Videos
            <span className="text-slate-400">•</span>
            <Mic className="w-5 h-5" />
            Audio
          </p>
        </div>

        {/* Magic Book Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative mb-8 flex items-center justify-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            disabled
          />
          
          {/* Magic Book Container */}
          <div className="relative">
            {/* Glow Effect */}
            <div 
              className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-500 ${
                bookState === 'idle' 
                  ? 'bg-indigo-200/0' 
                  : bookState === 'hovering'
                  ? 'bg-indigo-400/40'
                  : bookState === 'feeding'
                  ? 'bg-purple-500/60 animate-pulse'
                  : bookState === 'digesting'
                  ? 'bg-indigo-500/70 animate-pulse'
                  : 'bg-green-400/50'
              }`}
              style={{
                transform: `scale(${bookState === 'hovering' ? 1.1 : bookState === 'feeding' ? 1.15 : 1})`,
                transition: 'all 0.3s ease-out'
              }}
            />
            
            {/* Book */}
            <div 
              className={`
                relative w-80 h-96 md:w-96 md:h-[28rem] rounded-3xl
                bg-gradient-to-br from-slate-800 via-indigo-900 to-purple-900
                border-2 transition-all duration-500
                ${isDragging 
                  ? 'border-indigo-400 shadow-2xl shadow-indigo-500/50 scale-105' 
                  : 'border-slate-300/30 shadow-xl'
                }
                ${bookState === 'feeding' ? 'animate-pulse' : ''}
                ${bookState === 'digesting' ? 'animate-pulse' : ''}
              `}
              style={{
                boxShadow: bookState !== 'idle' 
                  ? `0 0 ${bookGlow}px rgba(139, 92, 246, 0.6), 0 0 ${bookGlow * 1.5}px rgba(99, 102, 241, 0.4)`
                  : undefined
              }}
            >
              {/* Book Pages Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {/* Page lines */}
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute left-8 right-8 h-px bg-white/10 transition-all duration-300 ${
                      bookState === 'digesting' ? 'animate-pulse' : ''
                    }`}
                    style={{
                      top: `${8 + i * 5}%`,
                      opacity: bookState === 'idle' ? 0.1 : bookState === 'hovering' ? 0.3 : 0.5,
                      transform: bookState === 'digesting' ? `translateX(${Math.sin(i) * 2}px)` : 'none'
                    }}
                  />
                ))}
              </div>
              
              {/* Book Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                {/* Book Icon */}
                <div className={`
                  mb-6 transition-all duration-500
                  ${bookState === 'hovering' ? 'scale-110' : ''}
                  ${bookState === 'feeding' ? 'scale-125 animate-bounce' : ''}
                  ${bookState === 'digesting' ? 'scale-110 rotate-12' : ''}
                  ${bookState === 'complete' ? 'scale-100' : ''}
                `}>
                  <BookOpen 
                    className={`w-20 h-20 md:w-24 md:h-24 transition-colors duration-300 ${
                      bookState === 'idle' 
                        ? 'text-indigo-300/50' 
                        : bookState === 'hovering'
                        ? 'text-indigo-400'
                        : bookState === 'feeding'
                        ? 'text-purple-400'
                        : bookState === 'digesting'
                        ? 'text-indigo-400 animate-pulse'
                        : 'text-green-400'
                    }`}
                  />
                </div>
                
                {/* Status Text */}
                <div className="space-y-2">
                  {bookState === 'idle' && (
                    <>
                      <p className="text-2xl font-bold text-white mb-2">
                        Feed Me Knowledge
                      </p>
                      <p className="text-indigo-200/80 text-sm">
                        Drag the file below into this book
                      </p>
                    </>
                  )}
                  {bookState === 'hovering' && (
                    <>
                      <p className="text-2xl font-bold text-indigo-300 mb-2 animate-pulse">
                        Yes! Feed me! 📖
                      </p>
                      <p className="text-indigo-200/80 text-sm">
                        Release to feed the book
                      </p>
                    </>
                  )}
                  {bookState === 'feeding' && (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
                        <p className="text-2xl font-bold text-purple-300">
                          Feeding...
                        </p>
                        <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
                      </div>
                      <p className="text-purple-200/80 text-sm">
                        The book is consuming your knowledge
                      </p>
                    </>
                  )}
                  {bookState === 'digesting' && (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                        <p className="text-2xl font-bold text-indigo-300">
                          Digesting...
                        </p>
                        <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                      </div>
                      <p className="text-indigo-200/80 text-sm">
                        Pages are turning, knowledge is being absorbed
                      </p>
                    </>
                  )}
                  {bookState === 'complete' && (
                    <>
                      <p className="text-2xl font-bold text-green-400 mb-2">
                        ✓ Knowledge Absorbed!
                      </p>
                      <p className="text-green-200/80 text-sm">
                        Ready to create your notes...
                      </p>
                    </>
                  )}
                </div>
                
                {/* Magic Particles */}
                {bookState !== 'idle' && (
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full bg-indigo-400 ${
                          bookState === 'feeding' || bookState === 'digesting' ? 'animate-ping' : ''
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

        {/* Try it out section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Feed the book with this sample!
          </h2>
          
          <div
            id="sample-file-card"
            draggable={true}
            onDragStart={handleSampleDragStart}
            onDragEnd={handleSampleDragEnd}
            onClick={handleSampleClick}
            onMouseDown={(e) => {
              // Prevent any default click behavior
              e.stopPropagation();
            }}
            className={`
              bg-white rounded-2xl p-6 border-2 cursor-move
              transition-all duration-300 relative overflow-hidden
              ${isDraggingSample 
                ? 'opacity-50 scale-95 border-purple-400 shadow-lg' 
                : 'border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:scale-105'
              }
            `}
            style={{
              userSelect: 'none', // Prevent text selection
            } as React.CSSProperties}
          >
            {/* Magic glow effect when dragging */}
            {isDraggingSample && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
            )}
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                transition-all duration-300
                ${isDraggingSample 
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 scale-110' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }
              `}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">
                  {sampleFile.title}
                </h3>
                <p className="text-slate-600 text-sm">
                  {sampleFile.subject} • {sampleFile.level}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {sampleFile.description}
                </p>
              </div>
              <div className={`
                text-sm flex items-center gap-2 transition-colors
                ${isDraggingSample ? 'text-purple-600' : 'text-slate-400'}
              `}>
                <Sparkles className="w-4 h-4" />
                <span>Drag to feed ↑</span>
              </div>
            </div>
          </div>
          
          {showClickHint && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-3 animate-in fade-in shadow-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">💡 Tip: Drag & Drop!</p>
                <p>Click won't work - you need to drag this file into the magic book above to continue</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


