"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Send, Menu, X, BookOpen, Sparkles, History, Plus
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

export default function ChatWithNotePage() {
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
          model: "gpt-4o-mini",
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

  return (
    <div className="h-screen flex bg-[#1A1B26] text-white overflow-hidden">
      {/* Left Sidebar - Notes List */}
      <NotesSidebar 
        isOpen={sidebarOpen} 
        toggle={() => setSidebarOpen(!sidebarOpen)} 
        notes={noteSessions}
        currentSessionId={selectedSessionId}
        onSelectNote={handleSelectNote}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0 z-10">
        
        {/* Header - Lighter theme */}
        <header className="h-auto min-h-[80px] flex flex-col gap-3 px-6 md:px-8 py-3 bg-[#252836]/90 backdrop-blur-xl border-b border-white/10 shadow-sm relative">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 via-indigo-500/30 to-transparent"></div>
          
          {/* Top row: Logo and Plan Info */}
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
                 <span className="text-slate-300">Free Plan</span>
               }
               {!isPro && <Link href="/pricing" className="text-purple-400 underline hover:text-purple-300 ml-2">Upgrade</Link>}
             </div>
           </div>
          </div>
          
          {/* Bottom row: Selected Note Info */}
          <div className="flex items-center gap-4 flex-wrap">
            {selectedSessionTitle && (
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {selectedSessionTitle}
              </div>
            )}
            {!selectedSessionId && (
              <div className="px-4 py-2 bg-slate-500/20 border border-slate-500/30 rounded-lg text-sm text-slate-300">
                Please select a note from the sidebar to start chatting
              </div>
            )}
          </div>
        </header>

        {/* Messages Area - Lighter theme */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-none bg-[#1A1B26]">
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

        {/* Input Area - Text only, lighter theme */}
        <div className="p-6 pb-8 bg-[#1A1B26]">
          <div className="max-w-4xl mx-auto relative">
             <div className="bg-[#252836]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:scale-[1.01] focus-within:shadow-purple-500/20 focus-within:border-purple-500/30 relative overflow-hidden">
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
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 shadow-lg shadow-purple-500/40 border border-purple-500/30"
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

