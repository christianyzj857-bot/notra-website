'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Youtube, Mic, AlertCircle, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { ONBOARDING_SAMPLES } from '@/sample-data/onboardingSamples';
import { onboardingSamples, type OnboardingRole } from '../config';
import { InlineMath, BlockMath } from 'react-katex';

// Import all image components
import { AlgebraHeroImage } from '@/components/onboarding-images/AlgebraHeroImage';
import { AlgebraConceptDiagram } from '@/components/onboarding-images/AlgebraConceptDiagram';
import { CalculusHeroImage } from '@/components/onboarding-images/CalculusHeroImage';
import { CalculusApplicationDiagram } from '@/components/onboarding-images/CalculusApplicationDiagram';
import { LinearAlgebraHeroImage } from '@/components/onboarding-images/LinearAlgebraHeroImage';
import { EigenDecompositionDiagram } from '@/components/onboarding-images/EigenDecompositionDiagram';
import { GradientHeroImage } from '@/components/onboarding-images/GradientHeroImage';
import { DirectionalDerivativeDiagram } from '@/components/onboarding-images/DirectionalDerivativeDiagram';
import { SalesDashboardHero } from '@/components/onboarding-images/SalesDashboardHero';
import { BusinessMetricsDiagram } from '@/components/onboarding-images/BusinessMetricsDiagram';
import { ActiveLearningHero } from '@/components/onboarding-images/ActiveLearningHero';
import { LearningStrategiesDiagram } from '@/components/onboarding-images/LearningStrategiesDiagram';

// Get hero image component for different roles
const getHeroImageComponent = (role: OnboardingRole | null) => {
  switch (role) {
    case 'middleschool':
      return <AlgebraHeroImage />;
    case 'highschool':
      return <CalculusHeroImage />;
    case 'undergrad':
      return <LinearAlgebraHeroImage />;
    case 'grad':
      return <GradientHeroImage />;
    case 'professional':
      return <SalesDashboardHero />;
    case 'educator':
      return <ActiveLearningHero />;
    default:
      return <AlgebraHeroImage />;
  }
};

// Get concept diagram component for different roles
const getConceptDiagramComponent = (role: OnboardingRole | null) => {
  switch (role) {
    case 'middleschool':
      return <AlgebraConceptDiagram />;
    case 'highschool':
      return <CalculusApplicationDiagram />;
    case 'undergrad':
      return <EigenDecompositionDiagram />;
    case 'grad':
      return <DirectionalDerivativeDiagram />;
    case 'professional':
      return <BusinessMetricsDiagram />;
    case 'educator':
      return <LearningStrategiesDiagram />;
    default:
      return <AlgebraConceptDiagram />;
  }
};

// Math inline component using KaTeX
const MathInline = ({ math }: { math: string }) => {
  try {
    return <InlineMath>{math}</InlineMath>;
  } catch (e) {
    return <span className="math-text text-slate-800">{math}</span>;
  }
};

// Math block component using KaTeX
const MathBlock = ({ math }: { math: string }) => {
  try {
    return <BlockMath>{math}</BlockMath>;
  } catch (e) {
    return <div className="math-block text-slate-900">{math}</div>;
  }
};

export default function OnboardingStep2() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingSample, setIsDraggingSample] = useState(false);
  const [hasDroppedSample, setHasDroppedSample] = useState(false);
  const [showClickHint, setShowClickHint] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [sampleFile, setSampleFile] = useState(ONBOARDING_SAMPLES.find(s => s.role === 'other')?.file || ONBOARDING_SAMPLES[0].file);
  const [bookState, setBookState] = useState<'idle' | 'hovering' | 'loading' | 'complete'>('idle');
  const [bookGlow, setBookGlow] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [noteContent, setNoteContent] = useState<any>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [rightPageScale, setRightPageScale] = useState(1);

  const loadingSteps = [
    { text: 'Analyzing content...', progress: 25 },
    { text: 'Extracting key ideas...', progress: 50 },
    { text: 'Generating structured notes...', progress: 75 },
    { text: 'Creating quizzes and flashcards...', progress: 90 },
    { text: 'Almost ready...', progress: 100 },
  ];

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

  // Loading effect when bookState is 'loading'
  useEffect(() => {
    if (bookState === 'loading') {
      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        if (stepIndex < loadingSteps.length) {
          setCurrentLoadingStep(stepIndex);
          setLoadingProgress(loadingSteps[stepIndex].progress);
          stepIndex++;
        }
      }, 650);

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 100) {
            const step = loadingSteps.find(s => s.progress > prev);
            if (step) {
              return Math.min(prev + 1, step.progress);
            }
            return prev + 0.5;
          } else {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
            // Load note content and show it
            loadNoteContent();
            return 100;
          }
        });
      }, 30);

      return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      };
    }
  }, [bookState]);

  // Load note content from config
  const loadNoteContent = () => {
    // Map role to config key
    const roleMap: Record<string, keyof typeof onboardingSamples> = {
      'middle_school': 'middleschool',
      'high_school': 'highschool',
      'undergraduate': 'undergrad',
      'graduate': 'grad',
      'working_professional': 'professional',
      'educator': 'educator',
      'other': 'other',
    };
    
    const stage = localStorage.getItem('onboarding_stage') || 'other';
    const configKey = roleMap[stage] || onboardingRole || 'other';
    const sample = onboardingSamples[configKey as keyof typeof onboardingSamples];
    
    if (sample?.note) {
      setNoteContent(sample.note);
      // Start scale animation after a brief delay
      setTimeout(() => {
        setRightPageScale(1.5);
        setTimeout(() => {
          setShowNotes(true);
          setBookState('complete');
        }, 300);
      }, 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Check if this is the sample file being dragged
    const draggedData = e.dataTransfer.getData('text/plain');
    const isSampleFile = draggedData === `sample-file-${onboardingRole}` || draggedData.includes('sample-file');
    
    if (!isSampleFile) {
      setBookState('idle');
      setBookGlow(0);
      return;
    }
    
    // Start loading sequence
    setBookState('loading');
    setBookGlow(150);
    setHasDroppedSample(true);
    setLoadingProgress(0);
    
    // Store file info
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_file_name', sampleFile.title);
      localStorage.setItem('onboarding_file_type', 'application/pdf');
      
      const sampleBundle = ONBOARDING_SAMPLES.find(s => s.role === onboardingRole) || 
                          ONBOARDING_SAMPLES.find(s => s.role === 'other') || 
                          ONBOARDING_SAMPLES[0];
      if (sampleBundle) {
        localStorage.setItem('onboarding_sample_data', JSON.stringify(sampleBundle));
      }
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
              
              {/* Left Page Content - Messy Old Notes */}
              <div className="relative h-full p-6 overflow-hidden z-10">
                {/* Messy handwritten notes effect */}
                <div className="absolute inset-0 p-4 space-y-3 opacity-60">
                  {/* Random text snippets at different angles */}
                  {[
                    { text: 'f(x) = x² + 3x - 2', top: '5%', left: '10%', rotate: '-2deg', size: 'text-xs' },
                    { text: 'Derivative: 2x + 3', top: '12%', left: '15%', rotate: '1deg', size: 'text-xs' },
                    { text: '∫ x dx = x²/2 + C', top: '20%', left: '8%', rotate: '-1deg', size: 'text-xs' },
                    { text: 'lim x→0 sin(x)/x = 1', top: '28%', left: '12%', rotate: '2deg', size: 'text-xs' },
                    { text: 'Matrix A = [1, 2; 3, 4]', top: '35%', left: '10%', rotate: '-1.5deg', size: 'text-xs' },
                    { text: 'Eigenvalue λ = 5', top: '42%', left: '15%', rotate: '1deg', size: 'text-xs' },
                    { text: '∇f = (∂f/∂x, ∂f/∂y)', top: '50%', left: '8%', rotate: '-2deg', size: 'text-xs' },
                    { text: 'Chain rule: d/dx f(g(x))', top: '58%', left: '12%', rotate: '1.5deg', size: 'text-xs' },
                    { text: 'Taylor series expansion...', top: '65%', left: '10%', rotate: '-1deg', size: 'text-xs' },
                    { text: 'Note: Check this later', top: '72%', left: '15%', rotate: '2deg', size: 'text-xs', style: 'italic' },
                    { text: '???', top: '80%', left: '8%', rotate: '0deg', size: 'text-lg', style: 'font-bold' },
                    { text: 'Remember: Always check units', top: '88%', left: '12%', rotate: '-1deg', size: 'text-xs' },
                  ].map((note, i) => (
                    <div
                      key={i}
                      className={`absolute ${note.size} text-slate-600 ${note.style || ''} font-mono`}
                      style={{
                        top: note.top,
                        left: note.left,
                        transform: `rotate(${note.rotate})`,
                        opacity: 0.4 + Math.random() * 0.3,
                      }}
                    >
                      {note.text}
                    </div>
                  ))}
                  
                  {/* Random lines and scribbles */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`line-${i}`}
                      className="absolute bg-slate-400/20"
                      style={{
                        top: `${10 + i * 11}%`,
                        left: `${5 + Math.random() * 10}%`,
                        width: `${30 + Math.random() * 40}%`,
                        height: '1px',
                        transform: `rotate(${-2 + Math.random() * 4}deg)`,
                        opacity: 0.2 + Math.random() * 0.3,
                      }}
                    />
                  ))}
                  
                  {/* Coffee stain effect */}
                  <div 
                    className="absolute rounded-full bg-amber-700/10 blur-xl"
                    style={{
                      top: '60%',
                      left: '20%',
                      width: '80px',
                      height: '80px',
                    }}
                  />
                  
                  {/* Highlighted text */}
                  <div 
                    className="absolute bg-yellow-200/30"
                    style={{
                      top: '25%',
                      left: '8%',
                      width: '35%',
                      height: '15px',
                      transform: 'rotate(-1deg)',
                    }}
                  />
                </div>
                
                {/* Overlay text */}
                <div className="relative z-10 mt-4">
                  <p className="text-sm font-semibold text-slate-500 italic">
                    Old messy notes...
                  </p>
                </div>
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
              
              {/* Right Page Content - Blank / Loading / Notes */}
              <div 
                className="relative h-full overflow-hidden z-10 transition-all duration-1000"
                style={{
                  transform: `scale(${rightPageScale})`,
                  transformOrigin: 'center center',
                }}
              >
                {bookState === 'idle' && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
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
                  </div>
                )}
                
                {bookState === 'hovering' && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
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
                  </div>
                )}
                
                {bookState === 'loading' && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    {/* Magic loading animation */}
                    <div className="mb-8 relative">
                      <div className="w-24 h-24 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-purple-500 animate-pulse" />
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full max-w-xs mb-4">
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full shadow-lg"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-2xl font-semibold text-indigo-600 mb-2">
                      {loadingProgress}%
                    </p>
                    
                    <p className="text-lg text-slate-600 font-medium animate-pulse">
                      {loadingSteps[currentLoadingStep]?.text || loadingSteps[loadingSteps.length - 1].text}
                    </p>
                    
                    {/* Magic particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random()}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {showNotes && noteContent && (
                  <div className="h-full overflow-y-auto p-6 text-left animate-in fade-in slide-in-from-bottom-4">
                    {/* Note content similar to step4 */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {noteContent.mainTitle}
                      </h2>
                      <p className="text-lg text-slate-600">{noteContent.mainSubtitle}</p>
                    </div>
                    
                    {/* Overview */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Overview</h3>
                      <p className="text-base text-slate-700 leading-relaxed">
                        {noteContent.sections.overview}
                      </p>
                    </div>
                    
                    {/* Key Concepts */}
                    {noteContent.sections?.keyConcepts && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Key Concepts</h3>
                        <div className="space-y-2">
                          {noteContent.sections.keyConcepts.map((concept: string, idx: number) => (
                            <div key={idx} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                              <p className="text-sm font-semibold text-slate-800">{concept}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Continue button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => {
                          localStorage.setItem('onboarding_complete', 'true');
                          window.location.href = '/onboarding/step4';
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg"
                      >
                        View Full Notes
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
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


