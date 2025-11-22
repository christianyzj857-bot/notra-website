'use client';

import React, { useState, useEffect } from 'react';
import { type OnboardingRole } from '@/types/notra';
import { type QuizItem } from '@/types/notra';
import { type OnboardingSampleBundle } from '@/types/notra';

export default function OnboardingStep5() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  useEffect(() => {
    // Check if user came from step4 and get sample data from localStorage
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
          if (sampleBundle.quizzes && sampleBundle.quizzes.length > 0) {
            // Show first quiz
            setQuiz(sampleBundle.quizzes[0]);
          }
        } catch (e) {
          console.error('Failed to parse sample data:', e);
        }
      }
    }
  }, []);

  const handleAnswerClick = (index: number) => {
    if (!quiz || selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(index);
    const correct = index === quiz.correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Auto navigate to Step 6 after showing feedback (2 seconds)
    setTimeout(() => {
      window.location.href = '/onboarding/step6';
    }, 2000);
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
        {quiz && (
          <div className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-6 transition-all duration-300 ${
            showFeedback 
              ? (isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-300')
              : 'border border-slate-200'
          }`}>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
              {quiz.question}
            </h2>

            <div className="space-y-4">
              {quiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === quiz.correctIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={selectedAnswer !== null}
                    className={`
                      w-full p-6 rounded-2xl border-2 text-left transition-all duration-300
                      ${isSelected
                        ? isCorrectOption
                          ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]'
                          : 'border-red-300 bg-red-50 animate-[shake_0.5s_ease-in-out]'
                        : 'border-slate-200 hover:border-[#9F6BFF] hover:shadow-md bg-white'
                      }
                      ${selectedAnswer !== null && !isSelected && !isCorrectOption ? 'opacity-60' : ''}
                      ${selectedAnswer === null ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                        transition-all duration-300
                        ${isSelected
                          ? isCorrectOption
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-red-400 text-white'
                          : 'bg-slate-100 text-slate-600'
                        }
                        ${isSelected && isCorrectOption ? 'scale-110' : ''}
                      `}>
                        {isSelected && isCorrectOption ? '✓' : isSelected ? '✗' : option.label}
                      </div>
                      <span className="text-lg font-medium text-slate-900 flex-1">
                        {option.text}
                      </span>
                      {isSelected && isCorrectOption && (
                        <span className="text-2xl">✅</span>
                      )}
                      {isSelected && !isCorrectOption && (
                        <span className="text-2xl">❌</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after answer) */}
            {showFeedback && quiz.explanation && (
              <div className={`mt-6 p-4 rounded-xl border-l-4 ${
                isCorrect ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'
              } animate-in fade-in slide-in-from-bottom-2`}>
                <p className={`font-semibold mb-2 ${
                  isCorrect ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {isCorrect ? '✅ Correct!' : '❌ Try again'}
                </p>
                <p className={`text-sm leading-relaxed ${
                  isCorrect ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {quiz.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {!quiz && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <p className="text-slate-600">Loading quiz...</p>
          </div>
        )}
      </div>
    </div>
  );
}
