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
        
        {/* Logo SVG - 根据图2设计：NOTRA文字+文档+电路板 */}
        <div 
          className={`
            relative w-full h-full rounded-lg overflow-hidden
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
              {/* 背景渐变：深蓝紫色到亮蓝色（上下渐变） */}
              <linearGradient id="notra-bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5B21B6" /> {/* 深蓝紫色顶部 */}
                <stop offset="50%" stopColor="#6366F1" /> {/* 亮蓝色中心 */}
                <stop offset="100%" stopColor="#5B21B6" /> {/* 深蓝紫色底部 */}
              </linearGradient>
              
              {/* 白色元素的内发光效果 */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* 背景：圆角方形，渐变填充 */}
            <rect
              x="3"
              y="3"
              width="94"
              height="94"
              rx="14"
              fill="url(#notra-bg-gradient)"
            />

            {/* 白色外边框（粗线） */}
            <rect
              x="3"
              y="3"
              width="94"
              height="94"
              rx="14"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              filter="url(#glow)"
            />

            {/* 左侧：文档/笔记本形状 */}
            {/* 垂直文档边缘线（左侧） */}
            <line
              x1="18"
              y1="22"
              x2="18"
              y2="78"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            
            {/* 文档底部：笔尖/倒V形（向下指向） */}
            <path
              d="M 18 78 L 13 88 L 18 88 Z"
              fill="white"
              filter="url(#glow)"
            />

            {/* 文档内容：三条横线（文本行） */}
            <line
              x1="24"
              y1="32"
              x2="38"
              y2="32"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <line
              x1="24"
              y1="42"
              x2="38"
              y2="42"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <line
              x1="24"
              y1="52"
              x2="38"
              y2="52"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* 右侧：电路板线条 */}
            {/* 从文档顶部延伸的电路线（向右上） */}
            <path
              d="M 38 32 L 48 32 L 48 26 L 58 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#glow)"
            />
            <circle
              cx="58"
              cy="26"
              r="3.5"
              fill="white"
              filter="url(#glow)"
            />

            {/* 从右上角延伸的电路线（向下再向左） */}
            <path
              d="M 97 3 L 87 3 L 87 12 L 77 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#glow)"
            />
            <circle
              cx="77"
              cy="12"
              r="3.5"
              fill="white"
              filter="url(#glow)"
            />

            {/* 中心：NOTRA 文字（白色，粗体，大写） */}
            <text
              x="50"
              y="62"
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="3"
              filter="url(#glow)"
              style={{ textRendering: 'optimizeLegibility' }}
            >
              NOTRA
            </text>
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
