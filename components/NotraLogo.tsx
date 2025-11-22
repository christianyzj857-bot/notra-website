import React from 'react';

interface NotraLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  variant?: "default" | "hero" | "minimal";
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
      animation: "logo-float-glow 5s ease-in-out infinite",
      glow: "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] drop-shadow-[0_0_16px_rgba(139,92,246,0.3)]",
      transform: "rotate(-4deg)",
    },
    hero: {
      animation: "logo-float-glow 4s ease-in-out infinite",
      glow: "drop-shadow-[0_0_12px_rgba(99,102,241,0.6)] drop-shadow-[0_0_24px_rgba(139,92,246,0.4)] drop-shadow-[0_0_32px_rgba(96,165,250,0.2)]",
      transform: "rotate(-6deg)",
    },
    minimal: {
      animation: "",
      glow: "drop-shadow-[0_0_3px_rgba(99,102,241,0.3)]",
      transform: "rotate(0deg)",
    }
  };

  const currentStyle = variantStyles[variant];

  return (
    <div className={`relative flex items-center gap-2 ${className} group select-none`} aria-label="Notra AI Logo">
      {/* Logo 容器 - 3D 效果容器 */}
      <div 
        className={`
          relative ${sizeClasses[size]} 
          transition-all duration-500
          group-hover:scale-110
        `}
        style={{
          transform: currentStyle.transform,
          animation: currentStyle.animation,
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {/* 3D Logo SVG */}
        <div 
          className={`
            relative w-full h-full
            ${currentStyle.glow}
            transition-all duration-300
          `}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}
          >
            <defs>
              {/* 主渐变：蓝紫科技感 */}
              <linearGradient id="notra-primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" /> {/* Indigo */}
                <stop offset="50%" stopColor="#8B5CF6" /> {/* Purple */}
                <stop offset="100%" stopColor="#60A5FA" /> {/* Blue */}
              </linearGradient>
              
              {/* 次要渐变：用于高光 */}
              <linearGradient id="notra-highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6" />
              </linearGradient>
              
              {/* 电路纹理渐变 */}
              <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#DDD6FE" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.3" />
              </linearGradient>
              
              {/* 发光滤镜 */}
              <filter id="logo-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* 内发光 */}
              <filter id="inner-glow">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feOffset in="blur" dx="0" dy="0" result="offsetBlur"/>
                <feFlood floodColor="#818CF8" floodOpacity="0.4"/>
                <feComposite in2="offsetBlur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* 3D 阴影 */}
              <filter id="depth-shadow">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
              </filter>
            </defs>

            {/* 背景：3D 芯片底座 */}
            <g transform="translate(10, 10)">
              {/* 底座阴影层 */}
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                rx="20"
                fill="url(#notra-primary-gradient)"
                opacity="0.9"
                filter="url(#depth-shadow)"
              />
              
              {/* 3D 高光层 */}
              <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="18"
                fill="url(#notra-highlight-gradient)"
                opacity="0.4"
              />
              
              {/* 电路纹理背景 */}
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                rx="20"
                fill="url(#circuit-gradient)"
                opacity="0.5"
              />
              
              {/* 电路线条纹理 */}
              <g opacity="0.3" stroke="#C7D2FE" strokeWidth="0.5">
                {/* 水平电路线 */}
                <line x1="15" y1="25" x2="85" y2="25" />
                <line x1="15" y1="50" x2="85" y2="50" />
                <line x1="15" y1="75" x2="85" y2="75" />
                
                {/* 垂直电路线 */}
                <line x1="25" y1="15" x2="25" y2="85" />
                <line x1="50" y1="15" x2="50" y2="85" />
                <line x1="75" y1="15" x2="75" y2="85" />
                
                {/* 电路节点 */}
                <circle cx="25" cy="25" r="1.5" fill="#818CF8" />
                <circle cx="50" cy="50" r="1.5" fill="#818CF8" />
                <circle cx="75" cy="75" r="1.5" fill="#818CF8" />
                <circle cx="25" cy="75" r="1.5" fill="#818CF8" />
                <circle cx="75" cy="25" r="1.5" fill="#818CF8" />
              </g>
              
              {/* 笔记纸张轮廓（subtle，作为背景） */}
              <path
                d="M 20 30 L 20 80 L 80 80 L 80 30 L 20 30 Z"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              
              {/* 笔记线条（subtle） */}
              <g opacity="0.2" stroke="rgba(255,255,255,0.5)" strokeWidth="1">
                <line x1="25" y1="40" x2="75" y2="40" />
                <line x1="25" y1="50" x2="75" y2="50" />
                <line x1="25" y1="60" x2="75" y2="60" />
                <line x1="25" y1="70" x2="75" y2="70" />
              </g>
              
              {/* 主 N 字母 - 3D 几何形态 + 电路风格 */}
              <g filter="url(#logo-glow-filter)">
                {/* N 的左侧竖线 - 带 3D 效果 */}
                <path
                  d="M 30 25 L 30 75"
                  stroke="url(#notra-primary-gradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M 30 25 L 30 75"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                
                {/* N 的对角线 - 带电路节点效果 */}
                <path
                  d="M 30 25 L 70 75"
                  stroke="url(#notra-primary-gradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M 30 25 L 70 75"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                
                {/* 对角线上的电路节点 */}
                <circle cx="50" cy="50" r="3" fill="#818CF8" filter="url(#inner-glow)" />
                <circle cx="50" cy="50" r="1.5" fill="white" />
                
                {/* N 的右侧竖线 - 带 3D 效果 */}
                <path
                  d="M 70 25 L 70 75"
                  stroke="url(#notra-primary-gradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M 70 25 L 70 75"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>
              
              {/* 笔尖装饰（subtle，在右下角） */}
              <g opacity="0.4" transform="translate(75, 80)">
                <path
                  d="M 0 0 L -5 8 L -2 8 L 0 5 Z"
                  fill="rgba(255,255,255,0.6)"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="0.5"
                />
              </g>
              
              {/* 3D 高光效果 */}
              <ellipse
                cx="35"
                cy="35"
                rx="15"
                ry="20"
                fill="rgba(255,255,255,0.2)"
                opacity="0.6"
                transform="rotate(-20 35 35)"
              />
              
              {/* 内发光边框 */}
              <rect
                x="2"
                y="2"
                width="96"
                height="96"
                rx="18"
                fill="none"
                stroke="rgba(129,140,248,0.4)"
                strokeWidth="1"
                filter="url(#inner-glow)"
              />
            </g>
          </svg>
        </div>
        
        {/* 外部光晕动画（仅 hero 和 default） */}
        {(variant === "hero" || variant === "default") && (
          <div 
            className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full -z-10 animate-pulse"
            style={{
              animationDuration: '3s',
            }}
          />
        )}
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
          style={{
            textShadow: variant === "hero" ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
          }}
        >
          Notra
        </span>
      )}
    </div>
  );
}
