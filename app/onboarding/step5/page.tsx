'use client';

import React, { useState, useEffect } from 'react';
import { onboardingSamples, type OnboardingRole } from '../config';

export default function OnboardingStep5() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [quiz, setQuiz] = useState(onboardingSamples['other'].quiz[0]);

  useEffect(() => {
    // Check if user came from step4 and get role
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole;
      if (!stage) {
        window.location.href = '/onboarding/step1';
      } else {
        setOnboardingRole(stage);
        const sampleData = onboardingSamples[stage] || onboardingSamples['other'];
        setQuiz(sampleData.quiz[0]);
      }
    }
  }, []);

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(index);
    setIsCorrect(index === quiz.correctAnswer);
    setShowFeedback(true);

    // Auto navigate to Step 6 after 1 second
    setTimeout(() => {
      window.location.href = '/onboarding/step6';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full animate-in fade-in duration-500">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-full h-1 bg-slate-200 rounded-full">
            <div className="h-full bg-[#9F6BFF] rounded-full" style={{ width: '71%' }} />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Crush your exams.
          </h1>
          <p className="text-xl text-slate-600">
            Auto-generated quizzes help you retain what you've learned.
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
            {quiz.question}
          </h2>

          <div className="space-y-4">
            {quiz.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === quiz.correctAnswer;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-full p-6 rounded-2xl border-2 text-left transition-all duration-300
                    ${isSelected
                      ? isCorrectOption
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-red-300 bg-red-50'
                      : 'border-slate-200 hover:border-[#9F6BFF] hover:shadow-md bg-white'
                    }
                    ${selectedAnswer !== null && !isSelected ? 'opacity-50' : ''}
                    ${selectedAnswer === null ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold
                      transition-colors duration-300
                      ${isSelected
                        ? isCorrectOption
                          ? 'bg-green-500 text-white'
                          : 'bg-red-400 text-white'
                        : 'bg-slate-100 text-slate-600'
                      }
                    `}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg font-medium text-slate-900 flex-1">
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Message */}
        {showFeedback && (
          <div className={`
            text-center p-4 rounded-xl font-semibold text-lg animate-in fade-in slide-in-from-bottom-4
            ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
          `}>
            {isCorrect ? 'Correct! ✅' : 'Good try! 💪'}
          </div>
        )}
      </div>
    </div>
  );
}
