'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { onboardingSamples, type OnboardingRole } from '../config';

export default function OnboardingStep6() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [flashcard, setFlashcard] = useState(onboardingSamples['other'].flashcards[0]);

  useEffect(() => {
    // Check if user came from step5 and get role
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole;
      if (!stage) {
        window.location.href = '/onboarding/step1';
      } else {
        setOnboardingRole(stage);
        const sampleData = onboardingSamples[stage] || onboardingSamples['other'];
        setFlashcard(sampleData.flashcards[0]);
      }
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped(true);
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

        {/* Flashcard */}
        <div className="flex justify-center mb-12">
          <div
            className="relative w-full max-w-md h-80 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front of card */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl border-2 border-slate-200 bg-white p-12 flex items-center justify-center shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-6">{flashcard.icon}</div>
                  <h2 className="text-4xl font-bold text-slate-900">
                    {flashcard.front}
                  </h2>
                  {!isFlipped && (
                    <p className="text-slate-500 mt-4">Tap to flip</p>
                  )}
                </div>
              </div>

              {/* Back of card */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl border-2 border-[#9F6BFF] bg-gradient-to-br from-purple-50 to-indigo-50 p-12 flex items-center justify-center shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Definition:
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {flashcard.back}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {isFlipped && (
          <div className="animate-in fade-in duration-500">
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-[#9F6BFF] text-white font-semibold rounded-xl hover:bg-[#8B5CF6] transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
