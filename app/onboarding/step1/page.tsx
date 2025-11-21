'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  School, 
  Briefcase, 
  Users, 
  HelpCircle
} from 'lucide-react';

// Custom Link component (matching existing pattern)
const Link = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

const categories = [
  { id: 'high-school', label: 'High School', icon: School },
  { id: 'undergrad', label: 'Undergraduate', icon: GraduationCap },
  { id: 'graduate', label: 'Graduate', icon: GraduationCap },
  { id: 'professional', label: 'Working Professional', icon: Briefcase },
  { id: 'educator', label: 'Educator', icon: Users },
  { id: 'other', label: 'Other', icon: HelpCircle },
];

export default function OnboardingStep1() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if already onboarded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded === 'true') {
        window.location.href = '/';
      }
    }
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsAnimating(true);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_stage', categoryId);
    }
    
    // Navigate to Step 2 after animation
    setTimeout(() => {
      window.location.href = '/onboarding/step2';
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      {/* Header with Logo */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center cursor-pointer group">
              <div className="relative flex h-9 w-9 items-center justify-center mr-3">
                {/* Dynamic background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all duration-300 group-hover:scale-110 animate-pulse" style={{ animationDuration: '3s' }}></div>
                
                {/* Rotating decorative ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 group-hover:rotate-180"></div>
                
                {/* Letter N with enhanced styling */}
                <span className="relative z-10 text-sm font-extrabold text-white tracking-tight transform group-hover:scale-110 transition-transform duration-300" style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.05em'
                }}>
                  N
                </span>
                
                {/* Highlight dot */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full blur-sm group-hover:bg-white/80 transition-all z-10"></div>
                
                {/* Sparkle particles */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                Notra
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl w-full animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              What describes you best?
            </h1>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                disabled={isAnimating}
                className={`
                  relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
                  ${isSelected 
                    ? 'border-[#9F6BFF] bg-[#9F6BFF]/10 shadow-lg scale-105' 
                    : 'border-slate-200 hover:border-[#9F6BFF]/50 hover:shadow-md bg-white'
                  }
                  ${isAnimating && !isSelected ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                    transition-colors duration-300
                    ${isSelected 
                      ? 'bg-[#9F6BFF] text-white' 
                      : 'bg-slate-100 text-slate-600'
                    }
                  `}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {category.label}
                  </span>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

