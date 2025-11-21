"use client";

import React, { useState } from "react";
import { 
  Mic, FileText, Video, Copy, Settings, LogOut, 
  Plus, History, Menu, Zap, Sparkles, MessageSquare, BarChart3, Image as ImageIcon, StopCircle, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 引入 Recharts 用于图表渲染
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// --- Types (导出类型供主页面使用) ---
export type Role = "user" | "assistant" | "system";
export type Provider = "openai" | "openai-mini" | "openai-5";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string | any[]; 
  type?: "text" | "audio" | "file" | "video_link" | "image" | "video_file"; 
  imageUrl?: string;
  fileName?: string;
  chartData?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

// --- Helper Components ---

// 1. 自定义 Link (解决预览环境问题)
export const Link = ({ href, children, className, ...props }: any) => {
  return <a href={href} className={className} {...props}>{children}</a>;
};

// 2. Notra Logo (统一设计，更有活力)
export const NotraLogo = ({ size = "default" }: { size?: "default" | "small" | "large" }) => {
  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    default: "w-10 h-10 text-sm",
    large: "w-12 h-12 text-base"
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center group`}>
      {/* 动态背景光晕效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all duration-300 group-hover:scale-110 animate-pulse" style={{ animationDuration: '3s' }}></div>
      
      {/* 旋转的装饰环 */}
      <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 group-hover:rotate-180"></div>
      
      {/* 字母N - 更有设计感 */}
      <div className="relative z-10 flex items-center justify-center">
        <span className="font-extrabold text-white tracking-tight transform group-hover:scale-110 transition-transform duration-300" style={{
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          letterSpacing: '-0.05em'
        }}>
          N
        </span>
        {/* 字母N上的高光点 */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full blur-sm group-hover:bg-white/80 transition-all"></div>
      </div>
      
      {/* 闪烁的粒子效果 */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

// 3. Chart Renderer
export const AIChart = ({ data }: { data: any }) => {
  if (!data || !data.data || !data.data.length) return null;
  
  const colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
  
  // Pie Chart 特殊处理
  if (data.type === 'pie') {
    return (
      <div className="my-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm w-full max-w-lg">
        <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">{data.title || "Data Visualization"}</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
  
  const ChartComponent = data.type === 'line' ? LineChart : (data.type === 'area' ? AreaChart : BarChart);
  const DataComponent = data.type === 'line' ? Line : (data.type === 'area' ? Area : Bar);
  const color = colors[0];

  return (
    <div className="my-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm w-full max-w-lg">
      <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">{data.title || "Data Visualization"}</h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data.data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" fontSize={12} stroke="#94A3B8" tickLine={false} axisLine={false} />
            <YAxis fontSize={12} stroke="#94A3B8" tickLine={false} axisLine={false} label={{ value: data.yLabel, angle: -90, position: 'insideLeft' }}/>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              cursor={{ fill: '#F1F5F9' }}
            />
            <DataComponent 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              radius={data.type === 'bar' ? 4 : undefined} 
              strokeWidth={3} 
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 4. Thinking Indicator
export const ThinkingIndicator = () => (
  <div className="flex items-center gap-3 p-4 text-slate-500 animate-pulse">
    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
       <Sparkles className="w-3 h-3 text-white" />
    </div>
    <span className="text-sm font-medium">Thinking...</span>
  </div>
);

// 5. Message Bubble
export const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  const isUser = msg.role === 'user';
  // 提取文本内容。如果内容是数组，找到 type='text' 的部分
  const textContent = Array.isArray(msg.content) 
    ? msg.content.find((c: any) => c.type === 'text')?.text || "" 
    : msg.content;

  const renderContent = () => {
    if (typeof textContent !== 'string') return null;
    
    // 解析图表 JSON（格式：```json:chart\n{...}\n```）
    const chartRegex = /```json:chart\s*\n([\s\S]*?)\n```/g;
    const parts: Array<{ type: 'text' | 'chart', content: any }> = [];
    let lastIndex = 0;
    let match;
    
    while ((match = chartRegex.exec(textContent)) !== null) {
      // 添加图表前的文本
      if (match.index > lastIndex) {
        const textPart = textContent.substring(lastIndex, match.index);
        if (textPart.trim()) {
          parts.push({ type: 'text', content: textPart });
        }
      }
      
      // 解析图表 JSON
      try {
        const chartData = JSON.parse(match[1]);
        parts.push({ type: 'chart', content: chartData });
      } catch (e) {
        // 如果解析失败，作为普通文本处理
        parts.push({ type: 'text', content: match[0] });
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加剩余文本
    if (lastIndex < textContent.length) {
      const remainingText = textContent.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }
    
    // 如果没有找到图表，返回整个文本
    if (parts.length === 0) {
      parts.push({ type: 'text', content: textContent });
    }
    
    return (
      <div className="space-y-4">
        {parts.map((part, idx) => {
          if (part.type === 'chart') {
            return <AIChart key={idx} data={part.content} />;
          }
          return (
            <div key={idx} className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-p:leading-relaxed prose-ul:space-y-2 prose-li:my-1">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed text-slate-700">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">{children}</strong>
                  ),
                  hr: () => (
                    <hr className="my-4 border-slate-200" />
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none space-y-3 my-4">{children}</ul>
                  ),
                  li: ({ children }) => {
                    const text = String(children);
                    // 检查是否包含emoji和粗体文本（功能列表格式）
                    if (text.match(/^[📝📄🎥📊🔍]/)) {
                      const parts = text.split(/\s{2,}/); // 按两个或更多空格分割
                      return (
                        <li className="flex flex-col gap-1 py-1">
                          <span className="font-semibold text-slate-900">{parts[0]}</span>
                          {parts[1] && <span className="text-slate-600 text-sm ml-6">{parts[1]}</span>}
                        </li>
                      );
                    }
                    return <li className="text-slate-700">{children}</li>;
                  },
                }}
              >
                {part.content}
              </ReactMarkdown>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Enhanced Avatar with glow effect */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center relative group ${
        isUser ? 'bg-slate-900 shadow-lg shadow-slate-900/30' : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/30'
      }`}>
        {/* Animated ring */}
        <div className={`absolute inset-0 rounded-full border-2 ${
          isUser ? 'border-slate-700' : 'border-blue-400/50'
        } opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity`}></div>
        
        {isUser ? (
          <span className="text-white text-xs font-bold relative z-10">U</span>
        ) : (
          <div className="relative z-10">
            <Zap className="w-4 h-4 text-white fill-current" />
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Message Content with enhanced styling */}
      <div className={`flex-1 max-w-[85%] md:max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-5 py-4 relative transition-all duration-300 hover:scale-[1.02] ${
          isUser 
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
            : 'bg-white/95 backdrop-blur-md border border-white/80 text-slate-800 shadow-lg shadow-blue-900/5'
        }`}>
          {/* Subtle gradient overlay for AI messages */}
          {!isUser && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 pointer-events-none"></div>
          )}
          {/* Content wrapper with relative positioning */}
          <div className="relative z-10">
            {/* 用户消息：显示图片或文件 */}
            {isUser && msg.imageUrl && (
              <div className="mb-3 rounded-xl overflow-hidden ring-2 ring-slate-700/50 shadow-lg">
                <img src={msg.imageUrl} alt="Uploaded" className="max-w-full h-auto max-h-64 object-contain" />
              </div>
            )}
            
            {isUser && msg.fileName && (
              <div className="mb-3 flex items-center gap-2 text-sm bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/50">
                <FileText size={16} className="text-blue-300" />
                <span>{msg.fileName}</span>
              </div>
            )}
            
            {/* 文本内容 */}
            {isUser ? (
              <div className="whitespace-pre-wrap break-words relative">
                {Array.isArray(msg.content) 
                  ? msg.content.find((c: any) => c.type === 'text')?.text || ""
                  : typeof msg.content === 'string' ? msg.content : ""}
              </div>
            ) : (
              <div className="relative">{renderContent()}</div>
            )}
          </div>
          
          {/* Decorative corner accent for AI messages */}
          {!isUser && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-2xl pointer-events-none"></div>
          )}
        </div>
      </div>
    </div>
  );
};

// 6. Sidebar Component
export const Sidebar = ({
  isOpen,
  toggle,
  onNewChat,
  history,
  currentSessionId,
  onLoadSession
}: {
  isOpen: boolean;
  toggle: () => void;
  onNewChat: () => void;
  history: ChatSession[];
  currentSessionId: string | null;
  onLoadSession: (session: ChatSession) => void;
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={toggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-semibold shadow-sm"
          >
            <Plus size={18} />
            New Chat
          </button>
          <button
            onClick={toggle}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        
        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chat history yet</p>
            </div>
          ) : (
            history.map((session) => (
              <button
                key={session.id}
                onClick={() => onLoadSession(session)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl transition-all
                  ${currentSessionId === session.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={14} />
                  <span className="font-medium text-sm truncate">
                    {session.title || "New Chat"}
                  </span>
                </div>
                <div className={`text-xs ${currentSessionId === session.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {new Date(session.timestamp).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Sparkles size={16} />
            Upgrade to Pro
          </Link>
        </div>
      </aside>
    </>
  );
};