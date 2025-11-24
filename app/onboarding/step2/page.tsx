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

        {/* Magic Book Drop Zone - Realistic Open Book Design */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative mb-8 flex items-center justify-center perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            disabled
          />
          
          {/* Glow Effect Behind Book */}
          <div 
            className={`absolute inset-0 blur-3xl transition-all duration-500 ${
              bookState === 'idle' 
                ? 'bg-indigo-200/0' 
                : bookState === 'hovering'
                ? 'bg-indigo-400/30'
                : bookState === 'feeding'
                ? 'bg-purple-500/50 animate-pulse'
                : bookState === 'digesting'
                ? 'bg-indigo-500/60 animate-pulse'
                : 'bg-green-400/40'
            }`}
            style={{
              transform: `scale(${bookState === 'hovering' ? 1.05 : bookState === 'feeding' ? 1.1 : 1})`,
              transition: 'all 0.3s ease-out'
            }}
          />
          
          {/* Open Book Container - 3D Effect */}
          <div 
            className={`
              relative w-full max-w-4xl h-[500px] md:h-[600px]
              transition-all duration-500
              ${isDragging ? 'scale-105' : ''}
              ${bookState === 'feeding' ? 'animate-pulse' : ''}
              ${bookState === 'digesting' ? 'animate-pulse' : ''}
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
                ${isDragging 
                  ? 'border-indigo-400 shadow-2xl shadow-indigo-500/30' 
                  : 'border-slate-200/50'
                }
              `}
              style={{
                transform: `perspective(1000px) rotateY(${bookState === 'digesting' ? '-5deg' : '0deg'})`,
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
                      bookState === 'digesting' ? 'bg-indigo-300/20 animate-pulse' : 'bg-slate-300/30'
                    }`}
                    style={{
                      top: `${5 + i * 3.5}%`,
                      opacity: bookState === 'idle' ? 0.2 : bookState === 'hovering' ? 0.4 : 0.6,
                      transform: bookState === 'digesting' ? `translateX(${Math.sin(i * 0.5) * 3}px)` : 'none'
                    }}
                  />
                ))}
                
                {/* Decorative corner ornament */}
                <div className="absolute top-8 left-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
              </div>
              
              {/* Left Page Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-center z-10">
                {bookState === 'idle' && (
                  <>
                    <div className="mb-6">
                      <BookOpen className="w-16 h-16 text-indigo-400/60" />
                    </div>
                    <p className="text-xl font-semibold text-slate-700 mb-2">
                      Ancient Knowledge
                    </p>
                    <p className="text-sm text-slate-500">
                      Awaits your contribution
                    </p>
                  </>
                )}
                {bookState === 'hovering' && (
                  <>
                    <div className="mb-6 animate-bounce">
                      <Sparkles className="w-16 h-16 text-indigo-500" />
                    </div>
                    <p className="text-xl font-bold text-indigo-600 mb-2 animate-pulse">
                      Ready to Receive!
                    </p>
                    <p className="text-sm text-indigo-500">
                      Release the file now
                    </p>
                  </>
                )}
                {(bookState === 'feeding' || bookState === 'digesting') && (
                  <>
                    <div className="mb-6">
                      <Sparkles className="w-16 h-16 text-purple-500 animate-spin" />
                    </div>
                    <p className="text-xl font-bold text-purple-600 mb-2">
                      {bookState === 'feeding' ? 'Absorbing...' : 'Processing...'}
                    </p>
                    <p className="text-sm text-purple-500">
                      {bookState === 'feeding' ? 'Knowledge flowing in' : 'Pages turning'}
                    </p>
                  </>
                )}
                {bookState === 'complete' && (
                  <>
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-3xl">✓</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600 mb-2">
                      Complete!
                    </p>
                    <p className="text-sm text-green-500">
                      Knowledge absorbed
                    </p>
                  </>
                )}
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
                ${isDragging 
                  ? 'border-indigo-400 shadow-2xl shadow-indigo-500/30' 
                  : 'border-slate-200/50'
                }
              `}
              style={{
                transform: `perspective(1000px) rotateY(${bookState === 'digesting' ? '5deg' : '0deg'})`,
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
                      bookState === 'digesting' ? 'bg-indigo-300/20 animate-pulse' : 'bg-slate-300/30'
                    }`}
                    style={{
                      top: `${5 + i * 3.5}%`,
                      opacity: bookState === 'idle' ? 0.2 : bookState === 'hovering' ? 0.4 : 0.6,
                      transform: bookState === 'digesting' ? `translateX(${Math.sin(i * 0.5) * -3}px)` : 'none'
                    }}
                  />
                ))}
                
                {/* Decorative corner ornament */}
                <div className="absolute top-8 right-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-indigo-200/30 rounded-lg" />
              </div>
              
              {/* Right Page Content - Main Message */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-center z-10">
                {bookState === 'idle' && (
                  <>
                    <div className="mb-8">
                      <div className="text-6xl mb-4">📖</div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                      Feed Me Knowledge
                    </h2>
                    <p className="text-lg text-slate-600 mb-2">
                      Drag the file below
                    </p>
                    <p className="text-sm text-slate-500">
                      into this magic book
                    </p>
                  </>
                )}
                {bookState === 'hovering' && (
                  <>
                    <div className="mb-8 animate-bounce">
                      <div className="text-6xl">✨</div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4 animate-pulse">
                      Yes! Feed me! 📖
                    </h2>
                    <p className="text-lg text-indigo-500 mb-2">
                      Release to feed the book
                    </p>
                    <p className="text-sm text-indigo-400">
                      I'm ready to absorb!
                    </p>
                  </>
                )}
                {bookState === 'feeding' && (
                  <>
                    <div className="mb-8">
                      <Sparkles className="w-16 h-16 text-purple-500 animate-spin mx-auto" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-purple-600 mb-4">
                      Feeding...
                    </h2>
                    <p className="text-lg text-purple-500 mb-2">
                      The book is consuming
                    </p>
                    <p className="text-sm text-purple-400">
                      your knowledge
                    </p>
                  </>
                )}
                {bookState === 'digesting' && (
                  <>
                    <div className="mb-8">
                      <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">
                      Digesting...
                    </h2>
                    <p className="text-lg text-indigo-500 mb-2">
                      Pages are turning
                    </p>
                    <p className="text-sm text-indigo-400">
                      Knowledge is being absorbed
                    </p>
                  </>
                )}
                {bookState === 'complete' && (
                  <>
                    <div className="mb-8">
                      <div className="text-6xl">✅</div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
                      ✓ Knowledge Absorbed!
                    </h2>
                    <p className="text-lg text-green-500 mb-2">
                      Ready to create
                    </p>
                    <p className="text-sm text-green-400">
                      your notes...
                    </p>
                  </>
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


