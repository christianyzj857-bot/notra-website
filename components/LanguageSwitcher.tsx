// Language Switcher Component
// Mimics international website language selection patterns
// Used in Settings page and potentially in navigation bar

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES, type Language } from '@/constants/languages';

interface LanguageSwitcherProps {
  value: string; // Current selected language code (e.g., 'en', 'zh-CN')
  onChange: (languageCode: string) => void;
  variant?: 'dropdown' | 'grid'; // Display style
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSwitcher({
  value,
  onChange,
  variant = 'dropdown',
  className = '',
  showLabel = true,
  size = 'md',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out 'other' option and map to actual languages
  const availableLanguages = LANGUAGES.filter(lang => lang.id !== 'other');

  // Find current language
  const currentLanguage = availableLanguages.find(
    lang => lang.code === value || lang.id === value
  ) || availableLanguages.find(lang => lang.code === 'en') || availableLanguages[0];

  // Handle 'other' option - default to English
  const handleLanguageChange = (lang: Language) => {
    if (lang.id === 'other') {
      onChange('en'); // Default to English for 'other'
    } else {
      onChange(lang.code || lang.id);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      item: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
    },
    md: {
      button: 'px-4 py-2 text-base',
      item: 'px-4 py-2.5 text-base',
      icon: 'w-5 h-5',
    },
    lg: {
      button: 'px-5 py-2.5 text-lg',
      item: 'px-5 py-3 text-lg',
      icon: 'w-6 h-6',
    },
  };

  const currentSize = sizeClasses[size];

  if (variant === 'grid') {
    // Grid layout (similar to onboarding)
    return (
      <div className={className}>
        {showLabel && (
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Language / 语言
          </label>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableLanguages.map((lang) => {
            const isSelected = (lang.code || lang.id) === value;
            return (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                    : 'border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-sm bg-white dark:bg-white/5'
                  }
                `}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
                  {lang.label}
                </div>
                {lang.nativeLabel && lang.nativeLabel !== lang.label && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {lang.nativeLabel}
                  </div>
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
      </div>
    );
  }

  // Dropdown layout (common in international websites)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-3">
          Language / 语言
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          ${currentSize.button}
          bg-white dark:bg-[#0B0C15] 
          border border-slate-200 dark:border-white/10 
          rounded-xl
          text-slate-700 dark:text-slate-300
          hover:border-indigo-300 dark:hover:border-indigo-500/50
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          transition-all duration-200
        `}
      >
        <div className="flex items-center gap-2">
          <Languages className={currentSize.icon} />
          <span className="font-medium">
            {currentLanguage.label}
            {currentLanguage.nativeLabel && currentLanguage.nativeLabel !== currentLanguage.label && (
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({currentLanguage.nativeLabel})
              </span>
            )}
          </span>
        </div>
        <ChevronDown
          className={`${currentSize.icon} text-slate-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0B0C15] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          <div className="py-2">
            {availableLanguages.map((lang) => {
              const isSelected = (lang.code || lang.id) === value;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`
                    w-full flex items-center justify-between
                    ${currentSize.item}
                    text-left
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.label}</span>
                    {lang.nativeLabel && lang.nativeLabel !== lang.label && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {lang.nativeLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className={`${currentSize.icon} text-indigo-600 dark:text-indigo-400`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

