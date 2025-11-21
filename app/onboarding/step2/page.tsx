'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Youtube, Mic, AlertCircle } from 'lucide-react';
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

  // Check if user came from step1 and get role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole;
      if (!stage) {
        window.location.href = '/onboarding/step1';
      } else {
        setOnboardingRole(stage as OnboardingRole);
        const sample = ONBOARDING_SAMPLES.find(s => s.role === stage) || ONBOARDING_SAMPLES.find(s => s.role === 'other') || ONBOARDING_SAMPLES[0];
        setSampleFile(sample.file);
      }
    }
  }, []);

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
    
    // Check if this is the sample file being dragged
    const draggedElement = e.dataTransfer.getData('text/plain');
    if (draggedElement === `sample-file-${onboardingRole}`) {
      // This is the sample file - allow it
      setHasDroppedSample(true);
      handleSampleFileUpload();
    } else {
      // User tried to drop their own file - ignore it
      return;
    }
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
    if (!hasDroppedSample) {
      // This should only be called after successful drop
      return;
    }
    
    // Store file info temporarily (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_file_name', sampleFile.title);
      localStorage.setItem('onboarding_file_type', 'application/pdf');
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
  };

  const handleSampleClick = () => {
    // Click only shows hint, doesn't upload
    setShowClickHint(true);
    
    // Add animation effect
    const card = document.getElementById('sample-file-card');
    if (card) {
      card.classList.add('animate-bounce');
      setTimeout(() => {
        card.classList.remove('animate-bounce');
      }, 1000);
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
            Upload Anything
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

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-3xl p-16 text-center
            transition-all duration-300 mb-8
            ${isDragging 
              ? 'border-[#9F6BFF] bg-[#9F6BFF]/10 shadow-xl scale-105' 
              : 'border-slate-300 bg-white/30'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            disabled
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center
              transition-colors duration-300
              ${isDragging ? 'bg-[#9F6BFF] text-white' : 'bg-slate-100 text-slate-600'}
            `}>
              <Upload className="w-10 h-10" />
            </div>
            <p className="text-2xl font-semibold text-slate-700">
              Drop the sample file here
            </p>
            <p className="text-slate-500">
              Drag the sample file below into this box
            </p>
            {showClickHint && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4" />
                <span>Drag this sample file into the box above to continue</span>
              </div>
            )}
          </div>
        </div>

        {/* Try it out section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Try it out!
          </h2>
          
          <div
            id="sample-file-card"
            draggable
            onDragStart={handleSampleDragStart}
            onDragEnd={handleSampleDragEnd}
            onClick={handleSampleClick}
            className={`
              bg-white rounded-2xl p-6 border-2 border-slate-200 cursor-move
              transition-all duration-300
              ${isDraggingSample 
                ? 'opacity-50 scale-95' 
                : 'hover:border-[#9F6BFF]/50 hover:shadow-lg hover:scale-105'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
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
              <div className="text-slate-400 text-sm">
                Drag me ↑
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

