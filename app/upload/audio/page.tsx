'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Loader2, AlertCircle, CheckCircle, Play, Square } from 'lucide-react';
import { ProcessResult } from '@/types/notra';
import { useRouter } from 'next/navigation';

export default function UploadAudioPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Create a File object from the blob
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setUploadedFile(file);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Free users: 1 minute limit
          if (newTime >= 60) {
            stopRecording();
            setError('Recording limit reached (1 minute for free users)');
          }
          return newTime;
        });
      }, 1000);
    } catch (err: any) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/ogg'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|m4a|ogg)$/i)) {
      setError('Please upload an audio file (MP3, WAV, WebM, M4A, or OGG).');
      return;
    }

    // Free users: 1 minute limit (rough estimate: 1MB per minute)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setError('File size exceeds limit. Free users can upload up to 1 minute of audio.');
      return;
    }

    setError(null);
    setUploadedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', uploadedFile);
      formData.append('fileName', uploadedFile.name);
      formData.append('fileType', uploadedFile.type);

      const response = await fetch('/api/process/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const result: ProcessResult = await response.json();
      router.push(`/dashboard/${result.sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload audio. Please try again.');
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Record or Upload Audio
          </h1>
          <p className="text-lg text-slate-600">
            Record lectures, upload audio files, or practice speaking - we'll transcribe and create study materials
          </p>
        </div>

        {/* Recording Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Record Audio</h2>
          
          {isRecording ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4 animate-pulse">
                  <Square className="w-12 h-12 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">
                  {formatTime(recordingTime)}
                </p>
                <p className="text-sm text-slate-500">
                  Recording... (1 minute limit for free users)
                </p>
              </div>
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
              >
                Stop Recording
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={startRecording}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                <Play className="w-5 h-5" />
                Start Recording
              </button>
              <p className="text-sm text-slate-500 mt-3">
                Free users: 1 minute limit
              </p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Or Upload Audio File</h2>
          
          <div
            onClick={() => audioInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
          >
            <input
              ref={audioInputRef}
              type="file"
              className="hidden"
              accept="audio/*"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
            
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-700">
                  Transcribing your audio and building notes...
                </p>
              </>
            ) : uploadedFile ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-1">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-slate-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-700 mb-2">
                  Click to select audio file
                </p>
                <p className="text-sm text-slate-500">
                  MP3, WAV, WebM, M4A, or OGG (max 1 minute for free users)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Upload Button */}
        {uploadedFile && !isUploading && (
          <button
            onClick={handleUpload}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Process Audio
          </button>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">What you'll get:</h3>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Transcribed lecture notes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Key concepts and summaries
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Practice quizzes and flashcards
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

