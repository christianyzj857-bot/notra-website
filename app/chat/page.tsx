"use client";

import React, { FormEvent, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Mic, Paperclip, Send, StopCircle, Youtube, Menu, X, 
  Loader2, FileText, Image as ImageIcon, Lock, Code, Sigma, Sparkles, BarChart3, Plus, MessageSquare, BookOpen
} from "lucide-react";

// 引入刚才创建的 UI 组件和类型
import { 
  NotraLogo, ThinkingIndicator, MessageBubble, Sidebar, Link,
  type ChatMessage, type ChatSession, type Provider 
} from "./chat-ui";
import { ChatMode } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import NextLink from 'next/link';

function NotraConsoleContent() {
  const searchParams = useSearchParams();
  
  // Check onboarding status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded !== 'true') {
        // Redirect to onboarding step 1 if not completed
        window.location.href = '/onboarding/step1';
      }
    }
  }, []);

  // --- State ---
  const welcomeMsg: ChatMessage = { id: 'welcome', role: "assistant", content: "👋 Hey! I'm Notra, your AI study companion. I help you turn lectures, notes, and study materials into organized knowledge.\n\n**What I can do:**\n\n📝 **Summarize lectures**  \nUpload audio recordings from class\n\n📄 **Organize notes**  \nUpload PDFs, slides, or documents\n\n🎥 **Extract key points**  \nPaste YouTube video links for automatic summaries\n\n📊 **Create study materials**  \nGenerate flashcards, summaries, and concept maps\n\n🔍 **Answer questions**  \nAsk me anything about your uploaded materials\n\n---\n\nTry uploading a lecture recording, a PDF, or paste a video link to get started! 🚀", type: 'text' };
  
  // Get sessionId from URL
  const urlSessionId = searchParams?.get('sessionId');
  
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
  
  // New state for mode and model
  const [mode, setMode] = useState<ChatMode>(urlSessionId ? "note" : "general");
  const [model, setModel] = useState<"gpt-4o-mini" | "gpt-4o" | "gpt-5.1">("gpt-4o-mini");
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [showProModelHint, setShowProModelHint] = useState(false);
  const [proModelHintMessage, setProModelHintMessage] = useState('');
  
  // Get user plan
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getCurrentUserPlan();
      setUserPlan(plan);
      setIsPro(plan === 'pro');
    }
  }, []);

  // Fetch session title when sessionId is present
  useEffect(() => {
    if (urlSessionId && mode === "note") {
      fetch(`/api/session/${urlSessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.title) {
            setSessionTitle(data.title);
          }
        })
        .catch(() => {});
    }
  }, [urlSessionId, mode]);
  
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
      // Map provider to model
      const modelMap: { [key: string]: "gpt-4o-mini" | "gpt-4o" | "gpt-5.1" } = {
        "openai-mini": "gpt-4o-mini",
        "openai": "gpt-4o",
        "openai-5": "gpt-5.1",
      };
      const currentModel = modelMap[provider] || model;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })), 
          model: currentModel,
          mode: mode,
          sessionId: mode === "note" ? (urlSessionId || null) : undefined,
          userPlan: isPro ? "pro" : "free",
        }),
      });
      if (!res.ok) {
        // Handle 429 limit reached error
        if (res.status === 429) {
          const errorData = await res.json().catch(() => ({}));
          if (errorData.error === 'limit_reached') {
            const limitMessage = `⚠️ You've reached the free plan limit\n\nYou've used up ${errorData.scope === 'chat' ? "today's free chat messages" : `your monthly ${errorData.scope} limit`}. Notra Pro gives you higher limits, faster models, and more powerful study tools.\n\n[Upgrade to Pro](${typeof window !== 'undefined' ? window.location.origin : ''}/pricing) to continue without interruptions.`;
            setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: limitMessage, type: 'text' }]);
            setIsSending(false);
            return;
          }
        }
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
    // 根据blob类型确定文件扩展名
    let fileName = 'recording.webm';
    if (blob.type.includes('ogg')) {
      fileName = 'recording.ogg';
    } else if (blob.type.includes('mp4') || blob.type.includes('video')) {
      fileName = 'recording.mp4';
    } else if (blob.type.includes('mp3')) {
      fileName = 'recording.mp3';
    } else if (blob.type.includes('wav')) {
      fileName = 'recording.wav';
    }
    
    formData.append("file", blob, fileName);
    
    try {
      console.log("Sending audio/video to transcribe API, file:", fileName);
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error 
          ? `${errorData.error}: ${errorData.message || "未知错误"}` 
          : `请求失败，状态码: ${res.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      console.log("Transcription response:", data);
      
      // 优化提示词：告诉 AI 这是转录文本，让它总结
      if (data.text && data.text.trim()) {
        sendMessage(`Below is a text transcript of audio/video. Please summarize and analyze it:\n\n"${data.text}"`, 'audio');
      } else if (data.error) {
        // 如果有错误信息，显示给用户
        alert(`转录失败: ${data.error} - ${data.message || "请检查音频/视频文件格式和质量"}`);
      } else {
        alert("转录失败：没有获取到文本内容。请检查音频/视频质量和API配置。");
      }
    } catch (e: any) { 
      console.error("Audio transcription error:", e);
      const errorMsg = e.message?.includes("API key") || e.message?.includes("OPENAI_API_KEY")
        ? "音频处理失败。请检查 OPENAI_API_KEY 环境变量是否已配置。"
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
      console.log("Processing video/audio file:", file.name, file.type, file.size);
      setIsTranscribing(true);
      try {
        await handleAudioUpload(file);
      } catch (error: any) {
        console.error("Video/audio upload error:", error);
        alert(`视频/音频处理失败: ${error.message || "未知错误"}`);
      } finally {
        setIsTranscribing(false);
      }
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
        
        console.log("Sending file to process-file API:", file.name, file.type, file.size);
        const res = await fetch("/api/process-file", { 
          method: "POST", 
          body: formData 
        });
        
        console.log("Process-file API response status:", res.status);
        const data = await res.json();
        console.log("Process-file API response data:", { 
          hasText: !!data.text, 
          textLength: data.text?.length, 
          error: data.error,
          message: data.message 
        });
        
        if (res.ok && data.text && data.text.trim()) {
          // 文件内容提取成功，发送给AI分析
          const fileContent = data.text;
          console.log("File content extracted successfully, length:", fileContent.length);
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
          // 显示更详细的错误信息
          const errorMessage = data.error 
            ? `${data.error}: ${data.message || "未知错误"}` 
            : data.message || "文件处理失败，请重试。";
          console.error("File processing failed:", errorMessage);
          alert(`文件处理失败: ${errorMessage}`);
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
            // Show upgrade hint
            setProModelHintMessage("Notra Pro unlocks GPT-4o and GPT-5.1 for complex essays, research papers, and grad-level questions. Visit the Pricing page to see what's included.");
            setShowProModelHint(true);
            // Hide hint after 5 seconds
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
      {/* Enhanced Sci-Fi Background with Dynamic Effects */}
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

      <Sidebar 
        isOpen={sidebarOpen} 
        toggle={() => setSidebarOpen(!sidebarOpen)} 
        onNewChat={handleNewChat} 
        history={chatHistory}
        currentSessionId={currentSessionId}
        onLoadSession={handleLoadSession}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0 z-10">
        
        <header className="h-auto min-h-[80px] flex flex-col gap-3 px-6 md:px-8 py-3 bg-[#0F111A]/90 backdrop-blur-xl border-b border-white/10 shadow-sm relative">
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
                 {/* 升级按钮，点击跳转到 Pricing */}
                 {!isPro && <Link href="/pricing" className="text-purple-400 underline hover:text-purple-300 ml-2">Upgrade</Link>}
             </div>

             <div className="flex gap-2 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
               <ModelBtn id="openai-mini" label="4o-Mini" /><ModelBtn id="openai" label="GPT-4o" isProReq /><ModelBtn id="openai-5" label="GPT-5.1" isProReq />
             </div>
           </div>
          </div>
          
          {/* Bottom row: Mode Selection & Plan Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                <button
                  onClick={() => {
                    if (mode === "note" && !urlSessionId) {
                      alert("You need to open this from a specific study session to chat with that note.");
                      return;
                    }
                    setMode("general");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === "general"
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline-block mr-2" />
                  General Chat
                </button>
                <button
                  onClick={() => {
                    if (!urlSessionId) {
                      alert("You need to open this from a specific study session to chat with that note.");
                      return;
                    }
                    setMode("note");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === "note"
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline-block mr-2" />
                  Chat with this Note
                </button>
              </div>
              
              {mode === "note" && sessionTitle && (
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                  From: {sessionTitle}
                </div>
              )}
            </div>

            {/* Plan & Model Info - Dark Theme */}
            <div className="flex items-center gap-4 flex-wrap">
              {userPlan === 'free' ? (
                <p className="text-sm text-slate-400">
                  Free plan – Using GPT-4o-mini. <NextLink href="/pricing" className="text-purple-400 hover:text-purple-300 hover:underline">Upgrade</NextLink> to unlock GPT-4o & GPT-5.1.
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Pro plan – You have access to GPT-4o & GPT-5.1.
                </p>
              )}
              
              {mode === "general" && (
                <p className="text-sm text-slate-500 italic">
                  You are chatting with Notra for general questions.
                </p>
              )}
              {mode === "note" && (
                <p className="text-sm text-slate-500 italic">
                  You are chatting with Notra about this study session.
                </p>
              )}
            </div>

            {/* Pro Model Upgrade Hint - Dark Theme */}
            {showProModelHint && (
              <div className="bg-purple-500/10 border-l-4 border-purple-500/50 p-4 rounded-lg animate-in slide-in-from-top-2 backdrop-blur-sm">
                <p className="text-sm text-purple-200 mb-3">{proModelHintMessage}</p>
                <div className="flex items-center gap-3">
                  <NextLink
                    href="/pricing"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-colors shadow-lg shadow-purple-500/30"
                  >
                    View Pro plans
                  </NextLink>
                  <button
                    onClick={() => setShowProModelHint(false)}
                    className="px-4 py-2 text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-none">
          <div className="max-w-4xl mx-auto pb-4">
             {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
             
             {isThinking && <div className="flex justify-start mb-6"><div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2rem] shadow-sm"><ThinkingIndicator /></div></div>}
             {isTranscribing && <div className="flex justify-center my-4"><div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-200 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-3 shadow-lg shadow-purple-500/20 animate-pulse"><Loader2 size={16} className="animate-spin" /> Processing Audio...</div></div>}
             
             <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-6 pb-8">
          <div className="max-w-4xl mx-auto relative">
             {(pendingImage || pendingFile) && (
               <div className="absolute bottom-full left-0 mb-4 p-2 bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-600/50 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                  {pendingImage && <img src={pendingImage} alt="Preview" className="h-14 w-14 object-cover rounded-xl" />}
                  {pendingFile && <div className="h-14 w-14 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl flex items-center justify-center"><FileText size={24} /></div>}
                  <button onClick={() => {setPendingImage(null); setPendingFile(null)}} className="bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-full p-1 transition-colors border border-slate-600/50"><X size={14} /></button>
               </div>
             )}

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
                    placeholder={isRecording ? "🎤 Listening to your lecture..." : "Upload lecture audio, paste a video link, or ask about your notes..."}
                    disabled={isRecording || isTranscribing || isThinking}
                    rows={1}
                    className="w-full max-h-48 min-h-[56px] bg-transparent border-none focus:ring-0 text-base text-white placeholder:text-slate-400 resize-none py-4 px-5 leading-relaxed"
                  />
                  
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex items-center gap-1">
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md,.json" />
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors border border-transparent hover:border-blue-500/30"><Plus size={20} /></button>
                       <button type="button" onClick={() => setInput(prev => prev + "Plot a bar chart for: ")} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-colors border border-transparent hover:border-indigo-500/30" title="Generate Chart"><BarChart3 size={20} /></button>
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
                       }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-transparent hover:border-red-500/30" title="Analyze Video Link"><Youtube size={20} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                       <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isRecording ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50"}`}>{isRecording ? <><StopCircle size={16} /> Stop</> : <><Mic size={16} /></>}</button>
                       <button type="submit" disabled={(!input.trim() && !pendingImage && !pendingFile) || isSending} className={`p-3 rounded-full transition-all shadow-sm ${(!input.trim() && !pendingImage && !pendingFile) ? "bg-slate-700/50 text-slate-500 border border-slate-600/50" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-lg shadow-blue-500/40 border border-blue-500/30"}`}><Send size={18} /></button>
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

export default function NotraConsole() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#F0F4F8] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <NotraConsoleContent />
    </Suspense>
  );
}