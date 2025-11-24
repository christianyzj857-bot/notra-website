"use client";

import React, { FormEvent, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Send, Menu, X, BookOpen, Sparkles, History, Plus, MessageSquare, Lock
} from "lucide-react";
import { 
  NotraLogo, ThinkingIndicator, MessageBubble, Link,
  type ChatMessage
} from "../chat-ui";
import { getCurrentUserPlan } from "@/lib/userPlan";

interface NoteSession {
  id: string;
  title: string;
  type: string;
  createdAt: string;
}

function ChatWithNoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('sessionId');
  
  // Check onboarding status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded !== 'true') {
        router.replace('/onboarding/step1');
      }
    }
  }, [router]);

  // --- State ---
  const welcomeMsg: ChatMessage = { 
    id: 'welcome', 
    role: "assistant", 
    content: "Ask me any question about your notes!", 
    type: 'text' 
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const [noteSessions, setNoteSessions] = useState<NoteSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessionId);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [isPro, setIsPro] = useState(false);
  const [model, setModel] = useState<"gpt-4o-mini" | "gpt-4o" | "gpt-5.1">("gpt-4o-mini");
  const [provider, setProvider] = useState<"openai-mini" | "openai" | "openai-5">("openai-mini");
  const [showProModelHint, setShowProModelHint] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user plan
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getCurrentUserPlan();
      setUserPlan(plan);
      setIsPro(plan === 'pro');
    }
  }, []);

  // Fetch all note sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions/recent?limit=100');
        if (response.ok) {
          const sessions = await response.json();
          setNoteSessions(sessions);
          
          // If sessionId is provided, set it as selected
          if (sessionId) {
            const session = sessions.find((s: NoteSession) => s.id === sessionId);
            if (session) {
              setSelectedSessionId(sessionId);
              setSelectedSessionTitle(session.title);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    
    fetchSessions();
  }, [sessionId]);

  // Update selected session title when sessionId changes
  useEffect(() => {
    if (selectedSessionId) {
      const session = noteSessions.find(s => s.id === selectedSessionId);
      if (session) {
        setSelectedSessionTitle(session.title);
        // Update URL without reload
        router.replace(`/chat/note?sessionId=${selectedSessionId}`, { scroll: false });
      }
    }
  }, [selectedSessionId, noteSessions, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !selectedSessionId) return;
    if (isSending || isThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
          })),
          mode: "note",
          sessionId: selectedSessionId,
          model: model,
          userPlan
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request.",
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      setIsThinking(false);
    }
  };

  const handleSelectNote = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMessages([welcomeMsg]);
  };

  // Notes Sidebar Component
  const NotesSidebar = ({
    isOpen,
    toggle,
    notes,
    currentSessionId,
    onSelectNote
  }: {
    isOpen: boolean;
    toggle: () => void;
    notes: NoteSession[];
    currentSessionId: string | null;
    onSelectNote: (sessionId: string) => void;
  }) => {
    return (
      <>
        {/* Overlay for mobile - Lighter theme */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={toggle}
          />
        )}
        
        {/* Sidebar - Lighter theme */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50
          w-80 bg-[#252836]/90 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}>
          {/* Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">My Notes</span>
            </div>
            <button
              onClick={toggle}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          
          {/* Notes List - Lighter theme */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {notes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <History size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notes yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl transition-all
                    ${currentSessionId === note.id
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/30 shadow-md shadow-purple-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={14} />
                    <span className="font-medium text-sm truncate">
                      {note.title}
                    </span>
                  </div>
                  <div className={`text-xs ${currentSessionId === note.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
          
          {/* Footer - Lighter theme */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-400 hover:bg-purple-500/20 rounded-xl transition-colors border border-purple-500/20"
            >
              <Sparkles size={16} />
              Upgrade to Pro
            </Link>
          </div>
        </aside>
      </>
    );
  };

  // Model Button Component
  const ModelBtn = ({ id, label, isProReq }: { id: "openai-mini" | "openai" | "openai-5", label: string, isProReq?: boolean }) => {
    const active = provider === id;
    const locked = isProReq && !isPro;
    
    // Map provider to model
    const modelMap: { [key: string]: "gpt-4o-mini" | "gpt-4o" | "gpt-5.1" } = {
      "openai-mini": "gpt-4o-mini",
      "openai": "gpt-4o",
      "openai-5": "gpt-5.1",
    };
    
    return (
      <button 
        onClick={() => { 
          if (!locked) {
            setProvider(id);
            setModel(modelMap[id] || "gpt-4o-mini");
            setShowProModelHint(false);
          } else {
            setShowProModelHint(true);
            setTimeout(() => setShowProModelHint(false), 5000);
          }
        }}
        className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${active ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/50 shadow-md shadow-purple-500/30' : (locked) ? 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed' : 'bg-white/5 text-slate-300 border-white/10 hover:border-purple-500/30 hover:text-purple-300 hover:bg-white/10'}`}>
        {label}
        {isProReq && !isPro && <Lock size={12} className="text-amber-500" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#0B0C15] font-sans overflow-hidden relative">
      {/* Enhanced Background with Dynamic Effects - Similar to General Chat */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-gradient-to-br from-blue-400/40 via-indigo-400/30 to-cyan-400/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{animationDuration: '8s'}}/>
        {/* Dark Purple-Tinted Background - Academic & Futuristic */}
        <div className="absolute inset-0 -z-20 bg-[#0B0C15]" />
        
        {/* Purple-tinted Glowing Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/25 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        
        {/* Grid pattern overlay for academic tech feel */}
        <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] opacity-[0.04] bg-center"></div>
        
        {/* Floating academic particles - subtle purple glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `particle-float ${10 + Math.random() * 20}s infinite linear`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>
      {/* Left Sidebar - Notes List */}
      <NotesSidebar 
        isOpen={sidebarOpen} 
        toggle={() => setSidebarOpen(!sidebarOpen)} 
        notes={noteSessions}
        currentSessionId={selectedSessionId}
        onSelectNote={handleSelectNote}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0 z-10">
        
        {/* Header - Similar to General Chat */}
        <header className="h-auto min-h-[80px] flex flex-col gap-3 px-6 md:px-8 py-3 bg-[#0F111A]/90 backdrop-blur-xl border-b border-white/10 shadow-sm relative z-10">
          {/* Subtle animated border glow - purple tinted */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 via-indigo-500/50 to-transparent"></div>
          
          {/* Top row: Logo and Model Selection */}
          <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 bg-white/10 rounded-lg border border-white/10">
               <Menu size={20} className="text-white" />
             </button>
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <NotraLogo size="sm" showText={true} variant="minimal" />
               </div>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                 {isPro ? 
                   <span className="text-amber-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> PRO Active</span> : 
                   <span className="text-slate-400">Free Plan</span>
                 }
                 {!isPro && <Link href="/pricing" className="text-purple-400 underline hover:text-purple-300 ml-2">Upgrade</Link>}
             </div>

             <div className="flex gap-2 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
               <ModelBtn id="openai-mini" label="4o-Mini" />
               <ModelBtn id="openai" label="GPT-4o" isProReq />
               <ModelBtn id="openai-5" label="GPT-5.1" isProReq />
             </div>
           </div>
          </div>
          
          {/* Bottom row: Mode Selection & Selected Note Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                <button
                  onClick={() => router.push('/chat')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-300 hover:bg-white/10"
                >
                  <MessageSquare className="w-4 h-4 inline-block mr-2" />
                  General Chat
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30"
                >
                  <BookOpen className="w-4 h-4 inline-block mr-2" />
                  Chat with this Note
                </button>
              </div>
              
              {selectedSessionTitle && (
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                  From: {selectedSessionTitle}
                </div>
              )}
            </div>

            {/* Plan & Model Info */}
            <div className="flex items-center gap-4 flex-wrap">
              {userPlan === 'free' ? (
                <p className="text-sm text-slate-400">
                  Free plan – Using GPT-4o-mini. <Link href="/pricing" className="text-purple-400 hover:text-purple-300 hover:underline">Upgrade</Link> to unlock GPT-4o & GPT-5.1.
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Pro plan – You have access to GPT-4o & GPT-5.1.
                </p>
              )}
              
              <p className="text-sm text-slate-500 italic">
                You are chatting with Notra about your notes.
              </p>
            </div>
          </div>
        </header>

        {/* Messages Area - Similar to General Chat */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-none bg-[#0B0C15]">
          <div className="max-w-4xl mx-auto pb-4">
             {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
             
             {isThinking && (
               <div className="flex justify-start mb-6">
                 <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2rem] shadow-sm">
                   <ThinkingIndicator />
                 </div>
               </div>
             )}
             
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Text only, Similar to General Chat */}
        <div className="p-6 pb-8 bg-[#0B0C15]">
          <div className="max-w-4xl mx-auto relative">
             <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-[2rem] shadow-2xl shadow-blue-900/20 p-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:scale-[1.01] focus-within:shadow-blue-500/30 focus-within:border-blue-500/50 relative overflow-hidden">
               {/* Subtle animated gradient border - blue tinted */}
               <div className="absolute inset-0 rounded-[2rem] opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-600/20 rounded-[2rem] blur-xl"></div>
               </div>
               <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="flex flex-col relative z-10">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder={selectedSessionId ? "Ask me any question about your notes..." : "Please select a note from the sidebar first"}
                    disabled={!selectedSessionId || isSending || isThinking}
                    rows={1}
                    className="w-full max-h-48 min-h-[56px] bg-transparent border-none focus:ring-0 text-base text-white placeholder:text-slate-400 resize-none py-4 px-5 leading-relaxed"
                  />
                  
                  <div className="flex items-center justify-end px-3 pb-2">
                    <button 
                      type="submit" 
                      disabled={!input.trim() || !selectedSessionId || isSending} 
                      className={`p-3 rounded-full transition-all shadow-sm ${
                        (!input.trim() || !selectedSessionId) 
                          ? "bg-slate-700/50 text-slate-500 border border-slate-600/50" 
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-lg shadow-blue-500/40 border border-blue-500/30"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
               </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatWithNotePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#0B0C15] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    }>
      <ChatWithNoteContent />
    </Suspense>
  );
}

