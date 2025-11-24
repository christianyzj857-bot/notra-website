// Country Switcher Component
// Similar to LanguageSwitcher but for countries

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 导入 createPortal
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
  // 使用 ref 来引用触发按钮
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 存储下拉菜单的位置信息
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Find current country
  const currentCountry = COUNTRIES.find(
    c => (c.code || c.id) === value
  ) || COUNTRIES[0];

  // 计算下拉菜单位置的函数
  const calculatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // 当菜单打开或窗口滚动/调整大小时重新计算位置
  useEffect(() => {
    calculatePosition();
    window.addEventListener('scroll', calculatePosition, { passive: true });
    window.addEventListener('resize', calculatePosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

  const handleCountryChange = (country: Country) => {
    onChange(country.code || country.id);
    setIsOpen(false);
  };

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
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-3">
          Country / Region / 国家/地区
        </label>
      )}
      <button
        ref={buttonRef} // 绑定 ref
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
          ${isOpen ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <Globe className={currentSize.icon} />
          <span className="font-medium truncate max-w-[120px]">
            {currentCountry.label}
          </span>
        </div>
        <ChevronDown
          className={`${currentSize.icon} text-slate-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* 使用 Portal 将下拉菜单渲染到 body */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* 透明遮罩层 */}
          <div
            className="fixed inset-0 z-[99998] bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉菜单主体 */}
          <div
            className="fixed z-[99999] bg-white dark:bg-[#0B0C15] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${Math.max(dropdownPosition.width, 240)}px`, // 国家名称较长，给一个更大的最小宽度
            }}
          >
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
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium leading-none mb-0.5 truncate">{country.label}</span>
                      {country.nativeLabel && country.nativeLabel !== country.label && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 leading-none truncate">
                          {country.nativeLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className={`${currentSize.icon} text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
