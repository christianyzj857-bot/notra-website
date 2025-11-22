import React from 'react';

interface NotraLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean; // 是否显示 "Notra" 文本
  variant?: "default" | "hero" | "minimal"; // 不同场景的样式变体
}

export default function NotraLogo({ 
  className = "", 
  size = "md",
  showText = false,
  variant = "default"
}: NotraLogoProps) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-24 h-24"
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl"
  };

  // 不同场景的动画和效果
  const variantStyles = {
    default: {
      animation: variant === "hero" ? "logo-float-glow 5s ease-in-out infinite" : "logo-subtle-glow 4s ease-in-out infinite",
      glow: variant === "hero" ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] drop-shadow-[0_0_16px_rgba(139,92,246,0.2)]" : "drop-shadow-[0_0_4px_rgba(99,102,241,0.3)]",
      transform: variant === "hero" ? "rotate(-6deg)" : "rotate(-3deg)",
    },
    minimal: {
      animation: "",
      glow: "drop-shadow-[0_0_2px_rgba(99,102,241,0.2)]",
      transform: "rotate(0deg)",
    }
  };

  const currentStyle = variantStyles[variant === "minimal" ? "minimal" : "default"];

  return (
    <div className={`relative flex items-center gap-2 ${className} group select-none`} aria-label="Notra AI Logo">
      {/* Logo 容器 - 圆角矩形，渐变背景，玻璃面板效果 */}
      <div 
        className={`
          relative ${sizeClasses[size]} 
          rounded-xl
          bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20
          dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-blue-500/30
          backdrop-blur-sm
          border border-indigo-400/30 dark:border-indigo-400/50
          p-1.5
          transition-all duration-500
          group-hover:scale-105
          group-hover:border-indigo-400/50 dark:group-hover:border-indigo-400/70
          ${variant === "hero" ? "shadow-[0_0_20px_rgba(99,102,241,0.3)] dark:shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "shadow-[0_0_10px_rgba(99,102,241,0.2)] dark:shadow-[0_0_10px_rgba(99,102,241,0.3)]"}
        `}
        style={{
          transform: currentStyle.transform,
          animation: currentStyle.animation,
        }}
      >
        {/* 渐变边框效果 - 伪元素 */}
        <div 
          className="absolute inset-0 rounded-xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4), rgba(96,165,250,0.4))',
            filter: 'blur(1px)',
            zIndex: -1,
          }}
        />
        
        {/* Logo SVG - N 字型笔记设计 */}
        <div 
          className={`
            relative w-full h-full rounded-lg overflow-visible
            ${currentStyle.glow}
            transition-all duration-300
          `}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              {/* 背景渐变：indigo 到 purple 到 blue */}
              <linearGradient id="notra-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" /> {/* Indigo */}
                <stop offset="50%" stopColor="#8B5CF6" /> {/* Purple */}
                <stop offset="100%" stopColor="#60A5FA" /> {/* Blue */}
              </linearGradient>
              
              {/* 发光效果 */}
              <filter id="logo-glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* 背景：圆角方形，渐变填充 */}
            <rect
              x="5"
              y="5"
              width="90"
              height="90"
              rx="18"
              fill="url(#notra-bg-gradient)"
            />

            {/* N 字型笔记设计 */}
            {/* 左侧竖线（N 的第一笔） */}
            <path
              d="M 25 20 L 25 80"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#logo-glow)"
            />
            
            {/* 对角线（N 的中间斜线） */}
            <path
              d="M 25 20 L 75 80"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#logo-glow)"
            />
            
            {/* 右侧竖线（N 的第二笔） */}
            <path
              d="M 75 20 L 75 80"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#logo-glow)"
            />

            {/* 笔记装饰：左侧装订线 */}
            <line
              x1="20"
              y1="30"
              x2="20"
              y2="70"
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            
            {/* 笔记装饰：页面线条（在 N 内部） */}
            <line
              x1="30"
              y1="45"
              x2="70"
              y2="55"
              stroke="white"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="55"
              x2="70"
              y2="65"
              stroke="white"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 内部发光效果 */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* Notra 文本 - 可选显示 */}
      {showText && (
        <span 
          className={`
            ${textSizeClasses[size]}
            font-bold
            bg-clip-text text-transparent
            bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400
            tracking-tight
            transition-all duration-300
            group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-blue-300
            ${variant === "hero" ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" : ""}
          `}
        >
          Notra
        </span>
      )}
    </div>
  );
}
