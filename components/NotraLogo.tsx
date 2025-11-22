import React from 'react';

interface NotraLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function NotraLogo({ className = "", size = "md" }: NotraLogoProps) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-24 h-24"
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className} group select-none`} aria-label="Notra AI Logo">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3"
        style={{
          animation: 'float-subtle 4s ease-in-out infinite alternate',
        }}
      >
        <defs>
          <linearGradient id="notra-gradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" /> {/* Indigo-500 */}
            <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet-500 */}
            <stop offset="100%" stopColor="#60A5FA" /> {/* Blue-400 */}
          </linearGradient>
        </defs>

        {/* Notebook Base - Tilted */}
        <path 
          d="M20 85 L85 85 L80 15 L15 15 L20 85 Z" 
          fill="url(#notra-gradient)"
          className="shadow-lg"
          style={{
            transform: 'skewY(-5deg) translate(0px, 0px)',
            transformOrigin: '50% 50%',
          }}
        />
        
        {/* Page Folds / Grid Lines */}
        <path 
          d="M25 25 L75 25 M25 35 L75 35 M25 45 L75 45 M25 55 L75 55" 
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.15"
          strokeLinecap="round"
          style={{
            transform: 'skewY(-5deg) translate(0px, 0px)',
            transformOrigin: '50% 50%',
          }}
        />

        {/* Central AI Core - Node Network & Glow */}
        <g 
          transform="translate(50 50)"
          className="animate-[slow-pulse-glow_3s_ease-in-out_infinite]"
        >
          {/* Main Core (White Glow) */}
          <circle cx="0" cy="0" r="10" fill="white" fillOpacity="0.9" />
          
          {/* Inner Node (Violet/AI Color) */}
          <circle cx="0" cy="0" r="4" fill="#6366F1" className="shadow-2xl" />
          
          {/* Surrounding Nodes (AI/Knowledge) */}
          <circle cx="0" cy="-20" r="2.5" fill="white" fillOpacity="0.8" />
          <circle cx="18" cy="12" r="2.5" fill="white" fillOpacity="0.8" />
          <circle cx="-18" cy="12" r="2.5" fill="white" fillOpacity="0.8" />

          {/* Connections */}
          <path d="M0 -10 L0 -17" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M9 5 L15 10" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M-9 5 L-15 10" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>

        {/* Top Highlight/Shimmer */}
        <path 
          d="M15 15 L80 15 L78 20 L18 20 L15 15 Z" 
          fill="white"
          fillOpacity="0.1"
          style={{
            transform: 'skewY(-5deg) translate(0px, 0px)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
    </div>
  );
}
