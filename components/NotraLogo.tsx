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
      glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] drop-shadow-[0_0_16px_rgba(59,130,246,0.3)]",
      transform: "rotate(-4deg)",
    },
    hero: {
      animation: "logo-float-glow 4s ease-in-out infinite",
      glow: "drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] drop-shadow-[0_0_24px_rgba(59,130,246,0.4)] drop-shadow-[0_0_32px_rgba(99,102,241,0.2)]",
      transform: "rotate(-6deg)",
    },
    minimal: {
      animation: "",
      glow: "drop-shadow-[0_0_3px_rgba(6,182,212,0.3)]",
      transform: "rotate(0deg)",
    }
  };

  const currentStyle = variantStyles[variant];

  return (
    <div className={`relative flex items-center gap-2 ${className} group select-none`} aria-label="Notra AI Logo">
      {/* Logo 容器 */}
      <div 
        className={`
          relative ${sizeClasses[size]} 
          transition-all duration-500
          group-hover:scale-110
        `}
        style={{
          transform: currentStyle.transform,
          animation: currentStyle.animation,
        }}
      >
        {/* Logo SVG - 基于用户提供的新设计 */}
        <div 
          className={`
            relative w-full h-full
            ${currentStyle.glow}
            transition-all duration-300
          `}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="notra-turbo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4"/>
                <stop offset="50%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#6366F1"/>
              </linearGradient>

              <linearGradient id="notra-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96"/>
                <stop offset="100%" stopColor="#E8F3FF" stopOpacity="1"/>
              </linearGradient>
            </defs>

            {/* 外圈 */}
            <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#notra-turbo)"/>

            {/* 内圈 */}
            <rect x="12" y="12" width="40" height="40" rx="14" fill="url(#notra-inner)"/>

            {/* Turbo 风 N */}
            <path
              d="M22 40 L22 24 C22 22 23 21 24.5 21 C26 21 27 22 28 24 L34 36 C34.8 37.6 35.6 38 36.6 38 C38.3 38 39 36.8 39 34.8 V24"
              fill="none"
              stroke="url(#notra-turbo)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {/* 外部光晕动画（仅 hero 和 default） */}
        {(variant === "hero" || variant === "default") && (
          <div 
            className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full -z-10 animate-pulse"
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
            bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400
            tracking-tight
            transition-all duration-300
            group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-indigo-300
            ${variant === "hero" ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : ""}
          `}
          style={{
            textShadow: variant === "hero" ? '0 0 12px rgba(6,182,212,0.3)' : 'none',
          }}
        >
          Notra
        </span>
      )}
    </div>
  );
}
