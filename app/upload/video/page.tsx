'use client';

import React, { useState } from 'react';
import { Video, Loader2, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { ProcessResult } from '@/types/notra';
import { useRouter } from 'next/navigation';

export default function UploadVideoPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!isValidUrl(videoUrl)) {
      setError('Please enter a valid URL (e.g., https://...)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/process/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Processing failed' }));
        throw new Error(errorData.error || 'Failed to process video');
      }

      const result: ProcessResult = await response.json();
      router.push(`/dashboard/${result.sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to process video. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Video Link
          </h1>
          <p className="text-lg text-slate-600">
            Paste a link from YouTube, Bilibili, TikTok, or other platforms to extract content and create study materials
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200">
            <label htmlFor="video-url" className="block text-lg font-semibold text-slate-900 mb-4">
              Video URL
            </label>
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="video-url"
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-lg"
                  disabled={isProcessing}
                />
              </div>
              
              <button
                type="submit"
                disabled={isProcessing || !videoUrl.trim()}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold text-lg rounded-xl hover:from-pink-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Process
                  </>
                )}
              </button>
            </div>
            
            {isProcessing && (
              <div className="mt-6 text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-700 mb-2">
                  Fetching transcript and building your study pack...
                </p>
                <p className="text-sm text-slate-500">
                  This may take a few moments
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Supported platforms:</h3>
            <ul className="space-y-2 text-slate-600 mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                YouTube
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Bilibili
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                TikTok
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Other video platforms
              </li>
            </ul>
            
            <h3 className="font-semibold text-slate-900 mb-3 mt-6">What you'll get:</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Key moments and summary extracted from your video
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Structured notes with important concepts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Quizzes and flashcards for practice
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}

