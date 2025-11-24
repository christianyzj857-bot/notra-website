'use client';

import React, { useState, useEffect } from 'react';
import { Languages, Check, Search } from 'lucide-react';
import { LANGUAGES, searchLanguages, type Language } from '@/constants/languages';
import NotraLogo from '@/components/NotraLogo';

// Custom Link component (matching existing pattern)
const Link = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default function OnboardingStep2Language() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>(LANGUAGES);

  // Check if user came from step2-country
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage');
      const country = localStorage.getItem('onboarding_country');
      if (!stage || !country) {
        window.location.href = '/onboarding/step1';
      }
    }
  }, []);

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredLanguages(searchLanguages(searchQuery));
    } else {
      setFilteredLanguages(LANGUAGES);
    }
  }, [searchQuery]);

  const handleContinue = () => {
    if (!selectedLanguage) {
      return; // Don't proceed if not selected
    }

    setIsAnimating(true);
    
    // Store in localStorage
    // Save to both ui_language (for UI) and onboarding_content_language (for content generation)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ui_language', selectedLanguage);
      localStorage.setItem('onboarding_content_language', selectedLanguage);
    }
    
    // Navigate to Step 2 (drag sample) after animation
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
              <NotraLogo size="sm" showText={true} variant="minimal" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl w-full animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              What language do you prefer?
            </h1>
          </div>

          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-lg"
              />
            </div>
          </div>

          {/* Language Selection Grid */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Languages className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Content Language</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredLanguages.map((language) => {
                const isSelected = selectedLanguage === language.id;
                
                return (
                  <button
                    key={language.id}
                    onClick={() => setSelectedLanguage(language.id)}
                    disabled={isAnimating}
                    className={`
                      relative p-6 rounded-2xl border-2 transition-all duration-300 text-center
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white'
                      }
                      ${isAnimating && !isSelected ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="font-semibold text-slate-900 text-lg mb-1">{language.label}</div>
                    {language.nativeLabel && language.nativeLabel !== language.label && (
                      <div className="text-xs text-slate-500">{language.nativeLabel}</div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {filteredLanguages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No languages found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedLanguage || isAnimating}
              className={`
                px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2
                ${selectedLanguage && !isAnimating
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              Continue
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

