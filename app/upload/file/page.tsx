'use client';

import React, { useState, useRef } from 'react';
import { FileText, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ProcessResult } from '@/types/notra';
import { useRouter } from 'next/navigation';

export default function UploadFilePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt|md)$/i)) {
      setError('Please upload a PDF, Word document, or text file.');
      return;
    }

    // Validate file size (10MB limit for free users)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit. Please use a smaller file.');
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
      formData.append('file', uploadedFile);
      formData.append('fileName', uploadedFile.name);
      formData.append('fileType', uploadedFile.type);

      const response = await fetch('/api/process/file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to process file');
      }

      const result: ProcessResult = await response.json();
      
      // Redirect to session detail page
      router.push(`/dashboard/${result.sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Upload a Document
          </h1>
          <p className="text-lg text-slate-600">
            Upload PDFs, Word documents, or text files to generate structured notes, quizzes, and flashcards
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
            transition-all duration-300 mb-6
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 shadow-xl scale-105' 
              : 'border-slate-300 bg-white/80 hover:border-indigo-300 hover:bg-indigo-50/30'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center gap-4">
            {isUploading ? (
              <>
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <p className="text-xl font-semibold text-slate-700">
                  Analyzing your document...
                </p>
                <p className="text-slate-500">
                  Extracting key concepts and generating study materials
                </p>
              </>
            ) : uploadedFile ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-600" />
                <div>
                  <p className="text-lg font-semibold text-slate-900 mb-1">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-700 mb-2">
                    Click to select or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">
                    PDF, Word, or text files (max 10MB)
                  </p>
                </div>
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
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Process File
          </button>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">What you'll get:</h3>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Structured notes with key concepts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Interactive quizzes to test your understanding
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Flashcards for spaced repetition
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

