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

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
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

  // Check if user is onboarded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded !== 'true') {
        window.location.href = '/onboarding/step1';
      }
      
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
      title: 'Untitled Note',
      type: 'document',
      createdAt: Date.now(),
      summary: 'Start adding content to your note...'
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
  };

  // Handle document upload
  const handleDocumentUpload = (file: File) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: file.name,
      type: 'document',
      createdAt: Date.now(),
      summary: generateDocumentSummary(file.name)
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
  };

  // Handle audio upload
  const handleAudioUpload = (file: File) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: file.name,
      type: 'audio',
      createdAt: Date.now(),
      summary: generateAudioSummary(file.name)
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
  };

  // Handle video link
  const handleVideoLink = () => {
    if (!videoUrl.trim()) return;
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: `Video: ${videoUrl.substring(0, 30)}...`,
      type: 'video',
      createdAt: Date.now(),
      summary: generateVideoSummary(videoUrl)
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setVideoUrl('');
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
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'audio':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'video':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-200/15 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="flex h-screen overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full flex flex-col p-6">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <NotraLogo size="md" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  Notra
                </span>
              </div>
            </div>

            {/* New Note Button */}
            <button
              onClick={handleNewNote}
              className="w-full mb-8 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Note
            </button>

            {/* My Notes Section */}
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                My Notes
              </h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  <p>No notes yet.</p>
                  <p className="mt-2">Upload a file to get started.</p>
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
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-slate-200 bg-white/50 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 text-sm truncate flex-1">
                          {project.title}
                        </h3>
                        <span className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border flex items-center gap-1 ${getTypeBadgeColor(project.type)}`}>
                          {getTypeIcon(project.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
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
              className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          )}
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                    Dashboard
                  </h1>
                  <p className="text-lg text-slate-600">
                    Upload files, record audio, or paste video links to create your notes
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200"
                >
                  <Menu className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              {/* User Plan & Usage Display */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {userPlan === 'pro' ? (
                      <>
                        <div className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Pro Plan
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm">
                          Free Plan
                        </div>
                        <NextLink
                          href="/pricing"
                          className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Upgrade
                        </NextLink>
                      </>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                {usage && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">File uploads</p>
                      <p className="font-semibold text-slate-900">
                        {usage.fileThisMonth} / {limits.maxFileSessionsPerMonth === 9999 ? '∞' : limits.maxFileSessionsPerMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Audio transcriptions</p>
                      <p className="font-semibold text-slate-900">
                        {usage.audioThisMonth} / {limits.maxAudioSessionsPerMonth === 9999 ? '∞' : limits.maxAudioSessionsPerMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Chat messages today</p>
                      <p className="font-semibold text-slate-900">
                        {usage.chatToday} / {limits.maxChatMessagesPerDay === 9999 ? '∞' : limits.maxChatMessagesPerDay}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Three Core Function Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Document Upload Card */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-dashed cursor-pointer
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${isDragging 
                    ? 'border-indigo-500 bg-indigo-50/80 shadow-lg' 
                    : 'border-slate-200 hover:border-indigo-300'
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-3">
                    Document
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Upload a document
                  </h3>
                  <p className="text-sm text-slate-600">
                    PDFs, PPT, Word, lecture slides, and more
                  </p>
                </div>
              </div>

              {/* Audio Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
                    <Mic className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
                    Audio
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Record or upload audio
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Lecture recordings, podcasts, meeting audio
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => alert('Recording coming soon')}
                    className="w-full px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Record audio
                  </button>
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full px-4 py-2.5 bg-white border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload audio file
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
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 hover:border-pink-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-100 mb-4">
                    <Video className="w-8 h-8 text-pink-600" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">
                    Video
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Video link
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Paste a link from YouTube, Bilibili, TikTok, or others
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleVideoLink();
                      }
                    }}
                  />
                  <button
                    onClick={handleVideoLink}
                    className="w-full px-4 py-2.5 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-all"
                  >
                    Process Video
                  </button>
                </div>
              </div>
            </div>

            {/* Latest Note Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Latest note
              </h2>

              {selectedProject ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {selectedProject.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${getTypeBadgeColor(selectedProject.type)}`}>
                          {getTypeIcon(selectedProject.type)}
                          {selectedProject.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(selectedProject.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
                      {selectedProject.summary}
                    </pre>
                  </div>

                  <button
                    onClick={() => window.location.href = `/dashboard/${selectedProject.id}`}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    Open in full view
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg mb-2">
                    No notes yet.
                  </p>
                  <p className="text-slate-400 text-sm">
                    Upload a file or record audio to see your first note.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

