// Country Switcher Component
// Similar to LanguageSwitcher but for countries

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES, type Country } from '@/constants/countries';

interface CountrySwitcherProps {
  value: string; // Current selected country code (e.g., 'CN', 'US')
  onChange: (countryCode: string) => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CountrySwitcher({
  value,
  onChange,
  className = '',
  showLabel = true,
  size = 'md',
}: CountrySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current country
  const currentCountry = COUNTRIES.find(
    c => (c.code || c.id) === value
  ) || COUNTRIES[0];

  const handleCountryChange = (country: Country) => {
    onChange(country.code || country.id);
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-3">
          Country / Region / 国家/地区
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
          <Globe className={currentSize.icon} />
          <span className="font-medium">
            {currentCountry.label}
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
            {COUNTRIES.map((country) => {
              const isSelected = (country.code || country.id) === value;
              return (
                <button
                  key={country.code || country.id}
                  type="button"
                  onClick={() => handleCountryChange(country)}
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
                  <span className="font-medium">{country.label}</span>
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

