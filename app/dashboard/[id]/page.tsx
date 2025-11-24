'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Mic, Video, Clock, ExternalLink, MessageSquare, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { NotraSession, NoteSection, QuizItem, Flashcard } from '@/types/notra';

type TabType = 'notes' | 'quiz' | 'flashcards';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<NotraSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number | null }>({});
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('This study session does not exist or has been deleted.');
          } else {
            setError('Failed to load session');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="w-5 h-5" />;
      case 'audio':
        return <Mic className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'file':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'audio':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'video':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleQuizAnswer = (quizId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [quizId]: optionIndex }));
  };

  const handleChatWithNote = () => {
    router.push(`/chat/note?sessionId=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-200 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  {session.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-md text-sm font-medium border flex items-center gap-2 ${getTypeBadgeColor(session.type)}`}>
                    {getTypeIcon(session.type)}
                    {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatDate(session.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={handleChatWithNote}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Chat with this Note
              </button>
            </div>
            <p className="text-sm text-slate-500 italic">
              Generated by Notra AI Notes Engine
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-6 border border-slate-200 flex gap-2">
          {(['notes', 'quiz', 'flashcards'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'flashcards') {
                  setFlashcardFlipped(false);
                }
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 shadow-xl">
          {activeTab === 'notes' && (
            <div className="space-y-8">
              {session.notes.map((section: NoteSection) => (
                <section key={section.id} className="border-b border-slate-200 pb-8 last:border-0">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700">
                      {section.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {section.example && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl mb-4">
                      <p className="font-semibold text-indigo-900 mb-2">Example:</p>
                      <p className="text-indigo-800">{section.example}</p>
                    </div>
                  )}
                  {section.tableSummary && section.tableSummary.length > 0 && (
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Term</th>
                            <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Definition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.tableSummary.map((row, idx) => (
                            <tr key={idx}>
                              <td className="border border-slate-300 px-4 py-2">{row.label}</td>
                              <td className="border border-slate-300 px-4 py-2">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-8">
              {session.quizzes.map((quiz: QuizItem) => {
                const userAnswer = quizAnswers[quiz.id];
                const isCorrect = userAnswer === quiz.correctIndex;
                const showResult = userAnswer !== null;

                return (
                  <div key={quiz.id} className="border-2 border-slate-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {quiz.question}
                    </h3>
                    <div className="space-y-3 mb-4">
                      {quiz.options.map((option, idx) => {
                        const isSelected = userAnswer === idx;
                        const isCorrectOption = idx === quiz.correctIndex;

                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && handleQuizAnswer(quiz.id, idx)}
                            disabled={showResult}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              showResult
                                ? isCorrectOption
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-slate-200 bg-slate-50'
                                : isSelected
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                            }`}
                          >
                            <span className="font-semibold mr-3">{option.label}.</span>
                            {option.text}
                            {showResult && isCorrectOption && (
                              <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                            )}
                            {showResult && isSelected && !isCorrectOption && (
                              <span className="ml-2 text-red-600 font-semibold">✗ Incorrect</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {showResult && (
                      <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                        <p className="font-semibold mb-2">
                          {isCorrect ? '✓ Correct!' : 'Good try!'}
                        </p>
                        <p className="text-slate-700">{quiz.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'flashcards' && session.flashcards.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div
                  className={`bg-white rounded-3xl p-12 border-4 border-slate-200 shadow-2xl min-h-[400px] flex items-center justify-center cursor-pointer transition-transform duration-500 ${
                    flashcardFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                >
                  <div className={`absolute inset-0 p-12 flex items-center justify-center ${flashcardFlipped ? 'hidden' : ''}`}>
                    <p className="text-3xl font-bold text-slate-900 text-center">
                      {session.flashcards[currentFlashcardIndex].front}
                    </p>
                  </div>
                  <div className={`absolute inset-0 p-12 flex items-center justify-center bg-indigo-50 rounded-3xl [transform:rotateY(180deg)] ${flashcardFlipped ? '' : 'hidden'}`}>
                    <p className="text-xl text-slate-700 text-center leading-relaxed">
                      {session.flashcards[currentFlashcardIndex].back}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => {
                    setCurrentFlashcardIndex(prev => Math.max(0, prev - 1));
                    setFlashcardFlipped(false);
                  }}
                  disabled={currentFlashcardIndex === 0}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="text-slate-600 font-semibold">
                  {currentFlashcardIndex + 1} / {session.flashcards.length}
                </div>

                <button
                  onClick={() => {
                    setCurrentFlashcardIndex(prev => Math.min(session.flashcards.length - 1, prev + 1));
                    setFlashcardFlipped(false);
                  }}
                  disabled={currentFlashcardIndex === session.flashcards.length - 1}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Flip Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

