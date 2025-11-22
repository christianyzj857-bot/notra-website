'use client';

import React, { useState, useEffect } from 'react';
import NotraLogo from '@/components/NotraLogo';
import { 
  Globe, 
  Languages,
  Check
} from 'lucide-react';

// Custom Link component (matching existing pattern)
const Link = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

const countries = [
  { id: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { id: 'china', label: 'China', flag: '🇨🇳' },
  { id: 'other', label: 'Other', flag: '🌍' },
];

const languages = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '简体中文' },
  { id: 'other', label: 'Other' },
];

export default function OnboardingStep2Location() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if user came from step1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage');
      if (!stage) {
        window.location.href = '/onboarding/step1';
      }
    }
  }, []);

  const handleContinue = () => {
    if (!selectedCountry || !selectedLanguage) {
      return; // Don't proceed if not both selected
    }

    setIsAnimating(true);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_country', selectedCountry);
      localStorage.setItem('onboarding_content_language', selectedLanguage);
    }
    
    // Navigate to Step 2 (drag sample) after animation
    setTimeout(() => {
      window.location.href = '/onboarding/step2';
    }, 300);
  };

  const canContinue = selectedCountry !== null && selectedLanguage !== null;

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
              Where are you studying now?
            </h1>
            <p className="text-xl text-slate-600">
              你目前主要在哪个国家学习或工作？
            </p>
          </div>

          {/* Country Selection */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Country / 国家</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {countries.map((country) => {
                const isSelected = selectedCountry === country.id;
                
                return (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
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
                    <div className="text-4xl mb-2">{country.flag}</div>
                    <div className="font-semibold text-slate-900">{country.label}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Languages className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Content Language / 内容语言</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {languages.map((language) => {
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
                    <div className="font-semibold text-slate-900 text-lg">{language.label}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!canContinue || isAnimating}
              className={`
                px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2
                ${canContinue && !isAnimating
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

