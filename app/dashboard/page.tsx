'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Mic, 
  Video, 
  Plus, 
  Upload, 
  Menu, 
  X,
  Clock,
  ExternalLink,
  Play,
  Crown,
  Sparkles
} from 'lucide-react';
import NotraLogo from '@/components/NotraLogo';
import { getCurrentUserPlan } from '@/lib/userPlan';
import { USAGE_LIMITS } from '@/config/usageLimits';
import NextLink from 'next/link';
import { t, getUILanguage } from '@/lib/i18n';
import MagicBookUpload from '@/components/MagicBookUpload';

// Type definitions
type ProjectType = 'document' | 'audio' | 'video';

interface Project {
  id: string;
  title: string;
  type: ProjectType;
  createdAt: number; // timestamp
  summary: string;
}

// Mock summary generators
const generateDocumentSummary = (fileName: string): string => {
  return `Key Concepts\n• Fundamental principles and core theories\n• Important definitions and terminology\n\nExamples\n• Practical applications and case studies\n• Real-world scenarios\n\nApplications\n• Industry use cases\n• Best practices and recommendations`;
};

const generateAudioSummary = (fileName: string): string => {
  return `Lecture Summary\n• Main topics covered: Introduction, Core Concepts, Applications\n• Key points: 15 important takeaways\n• Discussion highlights: Q&A session included\n\nAction Items\n• Review slides 3-7\n• Complete practice problems\n• Prepare for next session`;
};

const generateVideoSummary = (url: string): string => {
  return `Key Moments and Summary\n• Introduction (0:00-2:30): Overview of topic\n• Main Content (2:30-15:00): Detailed explanation\n• Examples (15:00-20:00): Practical demonstrations\n• Conclusion (20:00-22:00): Summary and next steps\n\nKey Takeaways\n• 5 main concepts explained\n• 3 practical examples demonstrated\n• Important notes for further study`;
};

// Format relative time
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('dashboard.justNow');
  if (minutes < 60) return t('dashboard.minAgo', { minutes: minutes.toString() });
  if (hours < 24) {
    if (hours === 1) return t('dashboard.hourAgo', { hours: hours.toString() });
    return t('dashboard.hoursAgo', { hours: hours.toString() });
  }
  if (days === 1) return t('dashboard.dayAgo', { days: days.toString() });
  return t('dashboard.daysAgo', { days: days.toString() });
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [usage, setUsage] = useState<{
    fileThisMonth: number;
    audioThisMonth: number;
    videoThisMonth: number;
    chatToday: number;
  } | null>(null);
  const [limits, setLimits] = useState(USAGE_LIMITS.free);
  const [currentLang, setCurrentLang] = useState<string>('en'); // Track language for re-render

  // Magic book upload state
  const [magicBookOpen, setMagicBookOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'audio' | 'video'>('file');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLoadingStep, setUploadLoadingStep] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatedSessionId, setGeneratedSessionId] = useState<string | null>(null);

  // Check if user is onboarded and get initial language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded !== 'true') {
        window.location.href = '/onboarding/step1';
      }
      
      // Get initial language
      const lang = getUILanguage();
      setCurrentLang(lang);
      
      // Get user plan and usage
      const plan = getCurrentUserPlan();
      setUserPlan(plan);
      setLimits(USAGE_LIMITS[plan]);
      
      // Fetch usage stats
      fetch('/api/usage')
        .then(res => res.json())
        .then(data => {
          if (data.usage) {
            setUsage(data.usage);
          }
        })
        .catch(err => console.error('Failed to fetch usage:', err));
    }
  }, []);

  // Listen for language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLanguageChange = () => {
        const newLang = getUILanguage();
        if (newLang !== currentLang) {
          setCurrentLang(newLang);
          // Force re-render by reloading page
          window.location.reload();
        }
      };

      // Listen for storage changes (when language is changed in another tab)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'ui_language' || e.key === 'onboarding_content_language') {
          handleLanguageChange();
        }
      };

      // Listen for custom language change event
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('languagechange', handleLanguageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('languagechange', handleLanguageChange);
      };
    }
  }, [currentLang]);

  // Load recent sessions on mount
  useEffect(() => {
    const loadRecentSessions = async () => {
      try {
        const response = await fetch('/api/sessions/recent');
        if (response.ok) {
          const sessions = await response.json();
          const formattedProjects: Project[] = sessions.map((s: any) => ({
            id: s.id,
            title: s.title,
            type: s.type,
            createdAt: new Date(s.createdAt).getTime(),
            summary: s.summaryForChat || 'No summary available'
          }));
          setProjects(formattedProjects);
          if (formattedProjects.length > 0) {
            setSelectedProject(formattedProjects[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load recent sessions:', error);
      }
    };
    loadRecentSessions();
  }, []);

  // Create new empty project
  const handleNewNote = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: t('dashboard.untitled'),
      type: 'document',
      createdAt: Date.now(),
      summary: t('dashboard.noProjectsDesc')
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
  };

  // Handle document upload
  const handleDocumentUpload = async (file: File) => {
    // Reset state
    setUploadError(null);
    setUploadProgress(0);
    setGeneratedSessionId(null);

    // Open magic book
    setUploadType('file');
    setUploadFileName(file.name);
    setMagicBookOpen(true);

    // Simulate progress updates
    const loadingSteps = [
      { step: 'Extracting text from document...', progress: 20 },
      { step: 'Analyzing content...', progress: 40 },
      { step: 'Extracting key ideas...', progress: 60 },
      { step: 'Generating structured notes...', progress: 80 },
      { step: 'Creating quizzes and flashcards...', progress: 95 },
    ];

    let currentStepIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentStepIndex < loadingSteps.length) {
        setUploadLoadingStep(loadingSteps[currentStepIndex].step);
        setUploadProgress(loadingSteps[currentStepIndex].progress);
        currentStepIndex++;
      }
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userPlan', userPlan);
      formData.append('model', 'gpt-4o-mini'); // Can be made dynamic based on user plan

      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process file');
      }

      const data = await response.json();

      setUploadProgress(100);
      setUploadLoadingStep('Almost ready...');
      setGeneratedSessionId(data.sessionId);

      // Wait a moment before allowing navigation
      setTimeout(() => {
        window.location.href = `/dashboard/${data.sessionId}`;
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('File upload error:', error);
      setUploadError(error.message || 'Failed to process file. Please try again.');
      setUploadProgress(0);
    }
  };

  // Handle audio upload
  const handleAudioUpload = async (file: File) => {
    // Reset state
    setUploadError(null);
    setUploadProgress(0);
    setGeneratedSessionId(null);

    // Open magic book
    setUploadType('audio');
    setUploadFileName(file.name);
    setMagicBookOpen(true);

    // Simulate progress updates
    const loadingSteps = [
      { step: 'Uploading audio file...', progress: 15 },
      { step: 'Transcribing audio with Whisper...', progress: 40 },
      { step: 'Analyzing transcript...', progress: 60 },
      { step: 'Generating structured notes...', progress: 80 },
      { step: 'Creating quizzes and flashcards...', progress: 95 },
    ];

    let currentStepIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentStepIndex < loadingSteps.length) {
        setUploadLoadingStep(loadingSteps[currentStepIndex].step);
        setUploadProgress(loadingSteps[currentStepIndex].progress);
        currentStepIndex++;
      }
    }, 1000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userPlan', userPlan);
      formData.append('model', 'gpt-4o-mini'); // Can be made dynamic based on user plan

      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process audio');
      }

      const data = await response.json();

      setUploadProgress(100);
      setUploadLoadingStep('Almost ready...');
      setGeneratedSessionId(data.sessionId);

      // Wait a moment before allowing navigation
      setTimeout(() => {
        window.location.href = `/dashboard/${data.sessionId}`;
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Audio upload error:', error);
      setUploadError(error.message || 'Failed to process audio. Please try again.');
      setUploadProgress(0);
    }
  };

  // Handle video link
  const handleVideoLink = async () => {
    if (!videoUrl.trim()) return;

    // Reset state
    setUploadError(null);
    setUploadProgress(0);
    setGeneratedSessionId(null);

    // Open magic book
    setUploadType('video');
    setUploadFileName(videoUrl);
    setMagicBookOpen(true);

    setUploadLoadingStep('Processing video URL...');
    setUploadProgress(20);

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          userPlan,
          model: 'gpt-4o-mini',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process video');
      }

      const data = await response.json();

      setUploadProgress(100);
      setUploadLoadingStep('Almost ready...');
      setGeneratedSessionId(data.sessionId);

      // Wait a moment before allowing navigation
      setTimeout(() => {
        window.location.href = `/dashboard/${data.sessionId}`;
      }, 2000);

    } catch (error: any) {
      console.error('Video processing error:', error);
      setUploadError(error.message || 'Video processing is currently under development. Please download the video\'s audio and use the Audio Upload feature instead.');
      setUploadProgress(0);
    } finally {
      setVideoUrl('');
    }
  };

  // Drag and drop handlers
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
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        handleAudioUpload(file);
      } else {
        handleDocumentUpload(file);
      }
    }
  };

  const getTypeBadgeColor = (type: ProjectType) => {
    switch (type) {
      case 'document':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'audio':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'video':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* 移除背景代码，由 MagicBackground 全局组件接管 */}
      
      {/* 3D Floating Notebooks - Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Notebook 1 - Top Right */}
        <div 
          className="absolute top-[10%] right-[5%] w-32 h-40 opacity-20"
          style={{
            animation: 'notebook-float-3d 8s ease-in-out infinite',
            animationDelay: '0s',
          }}
        >
          <div className="relative w-full h-full transform-gpu" style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl border border-white/20 backdrop-blur-sm"
                 style={{
                   transform: 'rotateY(-15deg) rotateX(10deg)',
                   boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
                 }}>
              <div className="absolute inset-2 rounded-lg bg-slate-900/50"></div>
              <div className="absolute top-3 left-3 right-3 h-0.5 bg-white/20"></div>
              <div className="absolute top-6 left-3 right-3 h-0.5 bg-white/10"></div>
            </div>
          </div>
        </div>
        
        {/* Notebook 2 - Bottom Left */}
        <div 
          className="absolute bottom-[15%] left-[8%] w-28 h-36 opacity-15"
          style={{
            animation: 'notebook-float-3d 10s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >
          <div className="relative w-full h-full transform-gpu" style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl border border-white/20 backdrop-blur-sm"
                 style={{
                   transform: 'rotateY(20deg) rotateX(-8deg)',
                   boxShadow: '0 10px 40px rgba(96, 165, 250, 0.3)',
                 }}>
              <div className="absolute inset-2 rounded-lg bg-slate-900/50"></div>
              <div className="absolute top-3 left-3 right-3 h-0.5 bg-white/20"></div>
            </div>
          </div>
        </div>
        
        {/* Notebook 3 - Center Right */}
        <div 
          className="absolute top-[50%] right-[15%] w-24 h-32 opacity-10"
          style={{
            animation: 'notebook-float-3d 12s ease-in-out infinite',
            animationDelay: '4s',
          }}
        >
          <div className="relative w-full h-full transform-gpu" style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl border border-white/20 backdrop-blur-sm"
                 style={{
                   transform: 'rotateY(-10deg) rotateX(5deg)',
                   boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
                 }}>
              <div className="absolute inset-2 rounded-lg bg-slate-900/50"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Sidebar - Dark Theme */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-[#0F111A]/90 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full flex flex-col p-6">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <NotraLogo size="md" showText={true} variant="minimal" />
              </div>
            </div>

            {/* New Note Button */}
            <button
              onClick={handleNewNote}
              className="w-full mb-8 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('dashboard.createNew')}
            </button>

            {/* My Notes Section */}
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {t('dashboard.recentProjects')}
              </h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  <p>{t('dashboard.noProjects')}</p>
                  <p className="mt-2">{t('dashboard.noProjectsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                        ${selectedProject?.id === project.id
                          ? 'border-indigo-500/50 bg-indigo-500/10 shadow-md shadow-indigo-500/20'
                          : 'border-white/10 bg-white/5 hover:border-indigo-500/30 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm truncate flex-1">
                          {project.title}
                        </h3>
                        <span className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border flex items-center gap-1 ${getTypeBadgeColor(project.type)}`}>
                          {getTypeIcon(project.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(project.createdAt)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile close button */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Dark Theme */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {t('dashboard.title')}
                  </h1>
                  <p className="text-lg text-slate-400">
                    {t('dashboard.noProjectsDesc')}
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* User Plan & Usage Display - Dark Theme */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {userPlan === 'pro' ? (
                      <>
                        <div className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30">
                          <Crown className="w-4 h-4" />
                          {t('dashboard.proPlan')}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-lg font-semibold text-sm border border-white/10">
                          {t('dashboard.freePlan')}
                        </div>
                        <NextLink
                          href="/pricing"
                          className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-400 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t('dashboard.upgrade')}
                        </NextLink>
                      </>
                    )}
                  </div>
                </div>

                {/* Usage Stats - Dark Theme */}
                {usage && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">{t('dashboard.fileUploads')}</p>
                      <p className="font-semibold text-white">
                        {usage.fileThisMonth} / {limits.maxFileSessionsPerMonth === 9999 ? '∞' : limits.maxFileSessionsPerMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">{t('dashboard.audioTranscriptions')}</p>
                      <p className="font-semibold text-white">
                        {usage.audioThisMonth} / {limits.maxAudioSessionsPerMonth === 9999 ? '∞' : limits.maxAudioSessionsPerMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">{t('dashboard.chatMessagesToday')}</p>
                      <p className="font-semibold text-white">
                        {usage.chatToday} / {limits.maxChatMessagesPerDay === 9999 ? '∞' : limits.maxChatMessagesPerDay}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Three Core Function Cards - Dark Theme */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Document Upload Card */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-dashed cursor-pointer
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${isDragging 
                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/30' 
                    : 'border-white/10 hover:border-indigo-500/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocumentUpload(file);
                  }}
                />
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-4">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
                    {t('dashboard.document')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('upload.file.title')}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {t('upload.file.supportedFormats')}
                  </p>
                </div>
              </div>

              {/* Audio Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 mb-4">
                    <Mic className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
                    {t('dashboard.audio')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('upload.audio.title')}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {t('upload.audio.supportedFormats')}
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => alert(t('upload.audio.processing'))}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                  >
                    <Play className="w-4 h-4" />
                    {t('chat.recordAudio')}
                  </button>
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full px-4 py-2.5 bg-white/5 border-2 border-purple-500/30 text-purple-300 font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {t('upload.audio.title')}
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioUpload(file);
                    }}
                  />
                </div>
              </div>

              {/* Video Link Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-500/30 mb-4">
                    <Video className="w-8 h-8 text-pink-400" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold mb-3 border border-pink-500/30">
                    {t('dashboard.video')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('upload.video.title')}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {t('upload.video.supportedPlatforms')}
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:border-pink-500/50 transition-colors text-white placeholder:text-slate-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleVideoLink();
                      }
                    }}
                  />
                  <button
                    onClick={handleVideoLink}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-rose-500 transition-all shadow-lg shadow-pink-500/30"
                  >
                    {t('dashboard.processVideo')}
                  </button>
                </div>
              </div>
            </div>

            {/* Latest Note Preview - Dark Theme */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                {t('dashboard.latestNote')}
              </h2>

              {selectedProject ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {selectedProject.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${getTypeBadgeColor(selectedProject.type)}`}>
                          {getTypeIcon(selectedProject.type)}
                          {selectedProject.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-400 mb-4">
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(selectedProject.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
                      {selectedProject.summary}
                    </pre>
                  </div>

                  <button
                    onClick={() => window.location.href = `/dashboard/${selectedProject.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 flex items-center gap-2"
                  >
                    {t('dashboard.openFullView')}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg mb-2">
                    {t('dashboard.noProjects')}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {t('dashboard.noProjectsDesc')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Magic Book Upload Modal */}
      <MagicBookUpload
        isOpen={magicBookOpen}
        type={uploadType}
        fileName={uploadFileName}
        progress={uploadProgress}
        loadingStep={uploadLoadingStep}
        error={uploadError}
        onComplete={(sessionId) => {
          window.location.href = `/dashboard/${sessionId}`;
        }}
        onClose={() => {
          setMagicBookOpen(false);
          setUploadError(null);
          setUploadProgress(0);
        }}
      />
    </div>
  );
}

