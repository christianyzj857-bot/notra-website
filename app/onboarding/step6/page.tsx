'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { type OnboardingRole } from '@/types/notra';
import { type Flashcard } from '@/types/notra';
import { type OnboardingSampleBundle } from '@/types/notra';

export default function OnboardingStep6() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Check if user came from step5 and get sample data from localStorage
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole;
      if (!stage) {
        window.location.href = '/onboarding/step1';
        return;
      }
      
      setOnboardingRole(stage);
      
      // Get sample data from localStorage (stored during drag-and-drop)
      const sampleDataStr = localStorage.getItem('onboarding_sample_data');
      if (sampleDataStr) {
        try {
          const sampleBundle: OnboardingSampleBundle = JSON.parse(sampleDataStr);
          if (sampleBundle.flashcards && sampleBundle.flashcards.length > 0) {
            setFlashcards(sampleBundle.flashcards);
          }
        } catch (e) {
          console.error('Failed to parse sample data:', e);
        }
      }
    }
  }, []);

  const currentFlashcard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleContinue = () => {
    window.location.href = '/onboarding/step7';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center animate-in fade-in duration-500">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
          Master your terms.
        </h1>
        <p className="text-xl text-slate-600 mb-12">
          Memorize key concepts with spaced repetition.
        </p>

        {/* Card Counter */}
        {flashcards.length > 0 && (
          <div className="text-center mb-4 text-slate-600 font-medium">
            Card {currentIndex + 1} / {flashcards.length}
          </div>
        )}

        {/* Flashcard */}
        {currentFlashcard && (
          <div className="flex justify-center mb-8">
            <div
              className="relative w-full max-w-md h-80 cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={handleFlip}
            >
              <div
                className="relative w-full h-full transition-transform duration-500 ease-in-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front of card */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl border-2 border-slate-200 bg-white p-12 flex items-center justify-center shadow-2xl hover:shadow-3xl transition-shadow"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}
                >
                  <div className="text-center w-full">
                    {currentFlashcard.tag && (
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                        {currentFlashcard.tag}
                      </span>
                    )}
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                      {currentFlashcard.front}
                    </h2>
                    {!isFlipped && (
                      <div className="flex items-center justify-center gap-2 text-slate-500 mt-6">
                        <RotateCw className="w-4 h-4" />
                        <p className="text-sm">Click to flip</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back of card */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-12 flex items-center justify-center shadow-2xl hover:shadow-3xl transition-shadow"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-center w-full">
                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
                      {currentFlashcard.back}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        {flashcards.length > 0 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`
                p-3 rounded-xl border-2 transition-all
                ${currentIndex === 0
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                  : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:scale-105'
                }
              `}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleFlip}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Flip
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className={`
                p-3 rounded-xl border-2 transition-all
                ${currentIndex === flashcards.length - 1
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                  : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:scale-105'
                }
              `}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Continue Button - Show after viewing all cards or on last card */}
        {flashcards.length > 0 && currentIndex === flashcards.length - 1 && isFlipped && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-green-800 font-semibold mb-2">Nice! You've completed this sample lesson</p>
            </div>
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-[#9F6BFF] text-white font-semibold rounded-xl hover:bg-[#8B5CF6] transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
            >
              Continue to Signup
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {flashcards.length === 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <p className="text-slate-600">Loading flashcards...</p>
          </div>
        )}
      </div>
    </div>
  );
}
