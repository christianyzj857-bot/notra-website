"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, CountryId } from '@/constants/countries';

interface CountrySwitcherProps {
  value: CountryId;
  onChange: (value: CountryId) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  includeOther?: boolean;
  showSearch?: boolean;
  showLabel?: boolean;
  className?: string;
}

const CountrySwitcher: React.FC<CountrySwitcherProps> = ({
  value,
  onChange,
  size = 'md',
  variant = 'default',
  includeOther = true,
  showSearch = true,
  showLabel = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const availableCountries = includeOther
    ? COUNTRIES
    : COUNTRIES.filter(c => c.id !== 'other');

  const selectedCountry = availableCountries.find(c => c.id === value) || availableCountries[0];

  // 计算位置函数
  const calculatePosition = () => {
    if (!buttonRef.current) return null;
    
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8, // 按钮下方 8px，使用 fixed 定位不需要 scrollY
      left: rect.left, // 使用 fixed 定位不需要 scrollX
      width: Math.max(rect.width, 240), // 最小宽度 240px
    };
  };

  // 当打开时计算位置
  useEffect(() => {
    if (isOpen) {
      // 立即计算一次
      const pos = calculatePosition();
      if (pos) {
        setPosition(pos);
      }
      
      // 延迟再计算一次，确保 DOM 已更新
      const timer = setTimeout(() => {
        const pos = calculatePosition();
        if (pos) {
          setPosition(pos);
        }
      }, 10);

      // 监听窗口变化
      const handleResize = () => {
        const pos = calculatePosition();
        if (pos) {
          setPosition(pos);
        }
      };

      const handleScroll = () => {
        const pos = calculatePosition();
        if (pos) {
          setPosition(pos);
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true); // 使用 capture 捕获所有滚动

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    } else {
      setPosition(null);
    }
  }, [isOpen]);

  const filteredCountries = availableCountries.filter(country => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(query) ||
      (country.nativeLabel && country.nativeLabel.toLowerCase().includes(query))
    );
  });

  const sizes = {
    sm: {
      button: 'text-xs px-2 py-1',
      icon: 'w-3.5 h-3.5',
      item: 'text-xs px-2 py-1.5',
      flag: 'text-sm'
    },
    md: {
      button: 'text-sm px-3 py-2',
      icon: 'w-4 h-4',
      item: 'text-sm px-3 py-2',
      flag: 'text-base'
    },
    lg: {
      button: 'text-base px-4 py-2.5',
      icon: 'w-5 h-5',
      item: 'text-base px-4 py-2.5',
      flag: 'text-lg'
    }
  };

  const currentSize = sizes[size];

  const buttonClasses = variant === 'default'
    ? `w-full flex items-center justify-between gap-2 rounded-xl border transition-all duration-200 font-medium
       bg-white dark:bg-white/5 border-slate-200 dark:border-white/10
       hover:border-indigo-500 dark:hover:border-indigo-400
       text-slate-700 dark:text-slate-300`
    : `flex items-center gap-2 rounded-lg transition-all duration-200 font-medium
       text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
       hover:bg-slate-100 dark:hover:bg-white/5`;

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      // 在打开前先计算位置
      const pos = calculatePosition();
      if (pos) {
        setPosition(pos);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-3">
          Country / Region / 国家/地区
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className={`${buttonClasses} ${currentSize.button} ${isOpen ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20' : ''}`}
      >
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <span className={currentSize.flag}>{selectedCountry.flag || '🌍'}</span>
          <span className="flex flex-col items-start text-left overflow-hidden">
            <span className="font-medium truncate leading-tight">{selectedCountry.label}</span>
            {variant === 'default' && selectedCountry.nativeLabel && selectedCountry.nativeLabel !== selectedCountry.label && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                {selectedCountry.nativeLabel}
              </span>
            )}
          </span>
        </div>
        <ChevronDown className={`flex-shrink-0 ${currentSize.icon} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-400`} />
      </button>

      {/* 使用 Portal 渲染下拉菜单 */}
      {isOpen && typeof window !== 'undefined' && position && createPortal(
        <>
          {/* 透明遮罩 */}
          <div
            className="fixed inset-0 z-[99998] bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉菜单 */}
          <div
            className="fixed z-[99999] bg-white dark:bg-[#0B0C15] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-96 overflow-hidden flex flex-col"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              maxWidth: '90vw',
            }}
          >
            {showSearch && (
              <div className="p-2 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#0B0C15] z-10">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentSize.icon} text-slate-400`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country..."
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border-none rounded-lg
                             text-slate-900 dark:text-white placeholder-slate-400
                             focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${currentSize.item}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto thin-scrollbar flex-1 p-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const isSelected = country.id === value;
                  return (
                    <button
                      key={country.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(country.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`
                        w-full flex items-center justify-between
                        ${currentSize.item} rounded-lg
                        text-left transition-colors duration-150
                        ${isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <span className={`${currentSize.flag} flex-shrink-0`}>{country.flag || '🌍'}</span>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate">{country.label}</span>
                          {country.nativeLabel && country.nativeLabel !== country.label && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {country.nativeLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className={`${currentSize.icon} text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2`} />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className={`text-center text-slate-500 dark:text-slate-400 py-4 ${currentSize.item}`}>
                  No countries found
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default CountrySwitcher;
