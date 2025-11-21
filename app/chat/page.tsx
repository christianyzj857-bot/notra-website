"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { 
  Mic, Paperclip, Send, StopCircle, Youtube, Menu, X, 
  Loader2, FileText, Image as ImageIcon, Lock, Code, Sigma, Sparkles, BarChart3, Plus
} from "lucide-react";

// 引入刚才创建的 UI 组件和类型
import { 
  NotraLogo, ThinkingIndicator, MessageBubble, Sidebar, Link,
  type ChatMessage, type ChatSession, type Provider 
} from "./chat-ui";

export default function NotraConsole() {
  // --- State ---
  const welcomeMsg: ChatMessage = { id: 'welcome', role: "assistant", content: "👋 Hey! I'm Notra, your AI study companion. I help you turn lectures, notes, and study materials into organized knowledge.\n\n**What I can do:**\n\n📝 **Summarize lectures**  \nUpload audio recordings from class\n\n📄 **Organize notes**  \nUpload PDFs, slides, or documents\n\n🎥 **Extract key points**  \nPaste YouTube video links for automatic summaries\n\n📊 **Create study materials**  \nGenerate flashcards, summaries, and concept maps\n\n🔍 **Answer questions**  \nAsk me anything about your uploaded materials\n\n---\n\nTry uploading a lecture recording, a PDF, or paste a video link to get started! 🚀", type: 'text' };
  
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]); 
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [provider, setProvider] = useState<Provider>("openai");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPro, setIsPro] = useState(false); // ⚠️ 这是一个模拟状态，用于 PRO 标识
  
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{name: string, type: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 提取YouTube视频ID的辅助函数
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  // 优化滚动逻辑，避免页面跳动
  useEffect(() => {
    if (messagesEndRef.current) {
      // 只在用户接近底部时才自动滚动
      const container = messagesEndRef.current.parentElement?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isNearBottom || messages.length <= 2) {
          // 使用 requestAnimationFrame 确保在DOM更新后滚动
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        }
      }
    }
  }, [messages.length]); // 只在消息数量变化时检查，而不是每次内容更新

  // --- Handlers ---
  
  // 自动重命名逻辑 (当用户输入第一条消息时，自动命名会话)
  useEffect(() => {
    if (currentSessionId && messages.length === 2 && messages[1].role === 'user') {
       const firstMsg = messages[1].content;
       const title = typeof firstMsg === 'string' ? firstMsg.substring(0, 30) : "Image Analysis";
       
       setChatHistory(prev => prev.map(s => s.id === currentSessionId ? { ...s, title } : s));
    }
  }, [messages, currentSessionId]);

  // 保存当前会话到历史记录
  const saveCurrentSession = () => {
    if (messages.length <= 1) return; 
    const session: ChatSession = {
      id: currentSessionId || Date.now().toString(),
      title: chatHistory.find(s => s.id === currentSessionId)?.title || "New Chat",
      messages: messages,
      timestamp: Date.now()
    };
    setChatHistory(prev => {
      const exists = prev.find(s => s.id === session.id);
      return exists ? prev.map(s => s.id === session.id ? session : s) : [session, ...prev];
    });
  };

  const handleNewChat = () => {
    saveCurrentSession();
    setMessages([{ id: Date.now().toString(), role: "assistant", content: "Ready for a new topic.", type: 'text' }]);
    setCurrentSessionId(Date.now().toString()); 
    setChatHistory(prev => [{ id: Date.now().toString(), title: "New Chat", messages: [], timestamp: Date.now() }, ...prev]);
    setInput(""); setPendingImage(null); setPendingFile(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleLoadSession = (session: ChatSession) => {
    saveCurrentSession();
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // --- 发送消息逻辑 ---
  const sendMessage = async (content: any, type: ChatMessage['type'] = 'text', imageUrl?: string, fileName?: string) => {
    if (!content && !imageUrl) return;

    // 格式化用户消息内容，以便后端 Vision API 识别
    const formattedContent: any[] = [];
    if (typeof content === 'string') {
      formattedContent.push({ type: "text", text: content });
    } else if (Array.isArray(content)) {
      formattedContent.push(...content);
    }
    if (imageUrl) {
      formattedContent.push({ type: "image_url", image_url: { url: imageUrl } });
    }
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: formattedContent, type, imageUrl, fileName };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!currentSessionId) setCurrentSessionId(Date.now().toString());
    setInput(""); setPendingImage(null); setPendingFile(null);
    setIsSending(true); setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 传递给后端的消息体：只包含角色和内容（后端会插入系统提示词）
        body: JSON.stringify({ messages: nextMessages.map(m => ({ role: m.role, content: m.content })), provider }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }
      
      setIsThinking(false);

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "", type: 'text' }]);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            // 使用函数式更新，避免频繁触发滚动
            setMessages(prev => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg && lastMsg.id === aiMsgId) {
                lastMsg.content = fullText;
              }
              return updated;
            });
            
            // 只在内容有明显变化时才滚动（每10个字符或完成时）
            if (fullText.length % 10 === 0 || chunk.length > 50) {
              requestAnimationFrame(() => {
                if (messagesEndRef.current) {
                  const container = messagesEndRef.current.parentElement?.parentElement;
                  if (container) {
                    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
                    if (isNearBottom) {
                      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
                    }
                  }
                }
              });
            }
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError);
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.id === aiMsgId) {
              lastMsg.content = fullText || "⚠️ Error reading response stream.";
            }
            return updated;
          });
        }
      }
    } catch (err: any) {
      setIsThinking(false);
      const errorMessage = err.message?.includes("API key") 
        ? "⚠️ API key error. Please check your OPENAI_API_KEY environment variable."
        : err.message?.includes("Failed to fetch")
        ? "⚠️ Network error. Please check your connection."
        : `⚠️ Error: ${err.message || "Unknown error occurred"}`;
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: errorMessage, type: 'text' }]);
    } finally { setIsSending(false); }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !pendingImage && !pendingFile) || isSending) return;
    
    // 处理图片和文本同时发送
    if (pendingImage) {
      sendMessage(input || "Analyze this image.", 'image', pendingImage);
    } 
    // 处理文件发送 (当前是 Mock 模式)
    else if (pendingFile) {
      sendMessage(`[Attached File: ${pendingFile.name}]\n${input || "Please analyze this file."}`, 'file', undefined, pendingFile.name);
    } 
    // 纯文本发送
    else { 
      sendMessage(input, 'text'); 
    }
  };

  // --- Media & File Handlers ---

  const handleAudioUpload = async (blob: Blob) => {
    console.log("Starting audio upload, blob size:", blob.size, "type:", blob.type);
    setIsTranscribing(true);
    const formData = new FormData();
    
    // 确保使用正确的文件名和类型
    const fileName = blob.type.includes('webm') ? 'recording.webm' : 'recording.ogg';
    formData.append("file", blob, fileName);
    
    try {
      console.log("Sending audio to transcribe API...");
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Transcription response:", data);
      
      // 优化提示词：告诉 AI 这是转录文本，让它总结
      if (data.text && data.text.trim()) {
        sendMessage(`Below is a text transcript of audio. Please summarize and analyze it:\n\n"${data.text}"`, 'audio');
      } else {
        alert("转录失败：没有获取到文本内容。请检查音频质量和API配置。");
      }
    } catch (e: any) { 
      console.error("Audio transcription error:", e);
      const errorMsg = e.message?.includes("API key") 
        ? "音频处理失败。请检查 OPENAI_API_KEY 环境变量。"
        : e.message?.includes("Missing") 
        ? "音频处理失败：缺少必要的配置。"
        : `音频处理失败: ${e.message || "未知错误"}`;
      alert(errorMsg);
    }
    finally { 
      setIsTranscribing(false);
      console.log("Audio upload completed");
    }
  };

  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      // 优化音频录制配置，提高转录质量
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // 保存stream引用，确保可以正确停止
      streamRef.current = stream;
      
      // 使用更好的编码格式和配置
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      // 检查浏览器是否支持该格式
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } else {
        // 降级到默认格式
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { 
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data); 
        }
      };
      mediaRecorderRef.current.onstop = async () => { 
        try {
          // 确保所有音频块都被收集
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log("Audio blob size:", audioBlob.size, "chunks:", audioChunksRef.current.length);
          
          if (audioBlob.size > 0) {
            await handleAudioUpload(audioBlob);
          } else {
            alert("录音失败：没有录制到音频数据，请重试。");
            setIsTranscribing(false);
          }
        } catch (error: any) {
          console.error("Error in onstop handler:", error);
          alert("处理录音时出错: " + (error.message || "未知错误"));
          setIsTranscribing(false);
        } finally {
          // 停止所有音频轨道
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
              track.stop();
              console.log("Stopped track:", track.kind);
            });
            streamRef.current = null;
          }
        }
      };
      
      // 监听错误
      mediaRecorderRef.current.onerror = (event: any) => {
        console.error("MediaRecorder error:", event);
        alert("录音过程中出错，请重试。");
        setIsRecording(false);
        setIsTranscribing(false);
      };
      
      mediaRecorderRef.current.start(1000); // 每1秒收集一次数据，提高稳定性
      setIsRecording(true);
      console.log("Recording started");
    } catch (err: any) { 
      console.error("Recording error:", err);
      alert(`麦克风访问失败: ${err.message || "请检查麦克风权限"}`); 
      setIsRecording(false);
    }
  };
  const stopRecording = () => { 
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log("Stopping recording, state:", mediaRecorderRef.current.state);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.log("MediaRecorder not active");
      setIsRecording(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader(); 
      reader.onload = (ev) => setPendingImage(ev.target?.result as string); 
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      // 视频和音频复用 transcribe 接口
      await handleAudioUpload(file);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf") || 
               file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
               file.name.endsWith(".doc") || file.name.endsWith(".docx") ||
               file.type.startsWith("text/") || file.name.endsWith(".txt") || 
               file.name.endsWith(".md") || file.name.endsWith(".json")) {
      // 处理PDF和文本文件 - 实际提取内容
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/process-file", { 
          method: "POST", 
          body: formData 
        });
        
        const data = await res.json();
        
        if (res.ok && data.text) {
          // 文件内容提取成功，发送给AI分析
          const fileContent = data.text;
          sendMessage(
            `Below is the content extracted from the file "${file.name}". Please analyze and summarize it:\n\n${fileContent}`,
            'file',
            undefined,
            file.name
          );
        } else if (data.error === "PDF_PARSER_NOT_AVAILABLE") {
          // PDF解析库未安装
          sendMessage(
            `PDF文件 "${file.name}" 需要安装pdf-parse库才能解析。\n\n请运行: npm install pdf-parse\n\n或者您可以：\n1. 复制PDF中的文本内容后直接粘贴\n2. 将PDF转换为TXT文件后上传`,
            'file',
            undefined,
            file.name
          );
        } else {
          alert(data.error || data.message || "文件处理失败，请重试。");
        }
      } catch (error: any) {
        console.error("File processing error:", error);
        alert("文件处理失败: " + (error.message || "未知错误"));
      } finally {
        setIsTranscribing(false);
      }
    } else {
      alert(`不支持的文件类型: ${file.type || "未知"}。目前支持: PDF, TXT, MD, JSON, 图片, 音频, 视频文件。`);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const ModelBtn = ({ id, label, isProReq }: { id: Provider, label: string, isProReq?: boolean }) => {
    const active = provider === id;
    const locked = isProReq && !isPro;
    return (
      <button 
        onClick={() => { if (!locked) setProvider(id); else alert("Please upgrade to Pro to use this model."); }}
        className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${active ? 'bg-slate-900 text-white border-slate-900 shadow-md' : (locked) ? 'bg-white/50 text-slate-400 border-transparent cursor-not-allowed' : 'bg-white text-slate-600 border-white/50 hover:border-blue-300 hover:text-blue-600'}`}>
        {label}
        {isProReq && !isPro && <Lock size={12} className="text-amber-500" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] font-sans overflow-hidden relative">
      {/* Enhanced Sci-Fi Background with Dynamic Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-gradient-to-br from-blue-400/40 via-indigo-400/30 to-cyan-400/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{animationDuration: '8s'}}/>
        <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-gradient-to-br from-indigo-400/40 via-purple-400/30 to-pink-400/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{animationDuration: '12s', animationDelay: '2s'}} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-br from-purple-400/40 via-blue-400/30 to-indigo-400/40 rounded-full blur-[110px] mix-blend-multiply animate-pulse" style={{animationDuration: '10s', animationDelay: '4s'}} />
        
        {/* Grid pattern overlay for tech feel */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-ping" style={{animationDuration: '3s', animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-400/40 rounded-full blur-sm animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400/30 rounded-full blur-sm animate-ping" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        toggle={() => setSidebarOpen(!sidebarOpen)} 
        onNewChat={handleNewChat} 
        history={chatHistory}
        currentSessionId={currentSessionId}
        onLoadSession={handleLoadSession}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0 z-10">
        
        <header className="h-20 flex items-center justify-between px-6 md:px-8 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm relative">
          {/* Subtle animated border glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 bg-white/50 rounded-lg">
               <Menu size={20} />
             </button>
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <NotraLogo />
                 <h2 className="text-lg font-bold text-slate-900">Notra AI</h2>
               </div>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-white/40 px-3 py-1.5 rounded-full border border-white/50">
                 {isPro ? 
                   <span className="text-amber-500 flex items-center gap-1"><Sparkles className="w-3 h-3" /> PRO Active</span> : 
                   <span className="text-slate-500">Free Plan</span>
                 }
                 {/* 升级按钮，点击跳转到 Pricing */}
                 {!isPro && <Link href="/pricing" className="text-blue-600 underline hover:text-blue-700 ml-2">Upgrade</Link>}
             </div>

             <div className="flex gap-2 bg-slate-200/50 p-1 rounded-2xl backdrop-blur-sm">
               <ModelBtn id="openai-mini" label="4o-Mini" /><ModelBtn id="openai" label="GPT-4o" isProReq /><ModelBtn id="openai-5" label="GPT-5.1" isProReq />
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-none">
          <div className="max-w-4xl mx-auto pb-4">
             {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
             
             {isThinking && <div className="flex justify-start mb-6"><div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-[2rem] shadow-sm"><ThinkingIndicator /></div></div>}
             {isTranscribing && <div className="flex justify-center my-4"><div className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-3 shadow-lg animate-pulse"><Loader2 size={16} className="animate-spin" /> Processing Audio...</div></div>}
             
             <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-6 pb-8">
          <div className="max-w-4xl mx-auto relative">
             {(pendingImage || pendingFile) && (
               <div className="absolute bottom-full left-0 mb-4 p-2 bg-white rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                  {pendingImage && <img src={pendingImage} alt="Preview" className="h-14 w-14 object-cover rounded-xl" />}
                  {pendingFile && <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FileText size={24} /></div>}
                  <button onClick={() => {setPendingImage(null); setPendingFile(null)}} className="bg-slate-100 rounded-full p-1 hover:bg-red-100 hover:text-red-500"><X size={14} /></button>
               </div>
             )}

             <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-2xl shadow-blue-900/10 p-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:scale-[1.01] focus-within:shadow-blue-500/20 relative overflow-hidden">
               {/* Subtle animated gradient border */}
               <div className="absolute inset-0 rounded-[2rem] opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl"></div>
               </div>
               <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="flex flex-col relative z-10">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder={isRecording ? "🎤 Listening to your lecture..." : "Upload lecture audio, paste a video link, or ask about your notes..."}
                    disabled={isRecording || isTranscribing || isThinking}
                    rows={1}
                    className="w-full max-h-48 min-h-[56px] bg-transparent border-none focus:ring-0 text-base text-slate-800 placeholder:text-slate-400 resize-none py-4 px-5 leading-relaxed"
                  />
                  
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex items-center gap-1">
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md,.json" />
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Plus size={20} /></button>
                       <button type="button" onClick={() => setInput(prev => prev + "Plot a bar chart for: ")} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Generate Chart"><BarChart3 size={20} /></button>
                       <button type="button" onClick={async () => { 
                         const l = prompt("YouTube Link:");
                         if (l) {
                           // 提取YouTube视频ID
                           const videoId = extractYouTubeId(l);
                           if (videoId) {
                             sendMessage(`Please analyze this YouTube video: ${l}\n\nNote: I cannot directly access YouTube videos. Please provide:\n1. The video transcript (if available)\n2. Key topics or sections you want analyzed\n3. Or describe what the video is about and I'll help you create study materials based on that.\n\nAlternatively, you can use tools like YouTube's auto-generated captions or transcript services to get the text content, then paste it here for analysis.`, 'video_link');
                           } else {
                             alert("Invalid YouTube link. Please provide a valid YouTube URL.");
                           }
                         }
                       }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Analyze Video Link"><Youtube size={20} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                       <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{isRecording ? <><StopCircle size={16} /> Stop</> : <><Mic size={16} /></>}</button>
                       <button type="submit" disabled={(!input.trim() && !pendingImage && !pendingFile) || isSending} className={`p-3 rounded-full transition-all shadow-sm ${(!input.trim() && !pendingImage && !pendingFile) ? "bg-slate-200 text-slate-400" : "bg-slate-900 text-white hover:scale-105"}`}><Send size={18} /></button>
                    </div>
                  </div>
               </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}