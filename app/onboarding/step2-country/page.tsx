'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Check, Search } from 'lucide-react';
import { COUNTRIES, searchCountries, type Country } from '@/constants/countries';
import NotraLogo from '@/components/NotraLogo';

// Custom Link component (matching existing pattern)
const Link = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default function OnboardingStep2Country() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(COUNTRIES);

  // Check if user came from step1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage');
      if (!stage) {
        window.location.href = '/onboarding/step1';
      }
    }
  }, []);

  // Filter countries based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredCountries(searchCountries(searchQuery));
    } else {
      setFilteredCountries(COUNTRIES);
    }
  }, [searchQuery]);

  const handleContinue = () => {
    if (!selectedCountry) {
      return; // Don't proceed if not selected
    }

    setIsAnimating(true);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_country', selectedCountry);
    }
    
    // Navigate to Step 2-language (Content Language) after animation
    setTimeout(() => {
      window.location.href = '/onboarding/step2-language';
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
              Where are you studying now?
            </h1>
          </div>

          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search your country or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-lg"
              />
            </div>
          </div>

          {/* Country Selection List */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Country / Region</h2>
            </div>
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredCountries.map((country) => {
                const isSelected = selectedCountry === country.id;
                
                return (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
                    disabled={isAnimating}
                    className={`
                      relative p-5 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md z-10' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
                      }
                      ${isAnimating && !isSelected ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="font-semibold text-slate-900 text-lg">{country.label}</div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {filteredCountries.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedCountry || isAnimating}
              className={`
                px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2
                ${selectedCountry && !isAnimating
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
