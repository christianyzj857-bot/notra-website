// Language Switcher Component
// Mimics international website language selection patterns
// Used in Settings page and potentially in navigation bar

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 导入 createPortal
import { Languages, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES, type Language } from '@/constants/languages';

interface LanguageSwitcherProps {
  value: string; // Current selected language code (e.g., 'en', 'zh-cn')
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
  // 使用 ref 来引用触发按钮，用于计算下拉菜单的位置
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 存储下拉菜单的位置信息
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Filter out 'other' option and map to actual languages
  const availableLanguages = LANGUAGES.filter(lang => lang.id !== 'other');

  // Find current language - match by id first (e.g., 'zh-cn'), then by code (e.g., 'zh-CN')
  const currentLanguage = availableLanguages.find(
    lang => lang.id === value || lang.id === value.toLowerCase() || 
            lang.code === value || lang.code?.toLowerCase() === value?.toLowerCase()
  ) || availableLanguages.find(lang => lang.id === 'en' || lang.code === 'en') || availableLanguages[0];

  // 计算下拉菜单位置的函数
  const calculatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 按钮下方 4px
        left: rect.left + window.scrollX, // 与按钮左对齐
        width: rect.width // 宽度与按钮一致
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

  // Handle 'other' option - default to English
  const handleLanguageChange = (lang: Language) => {
    if (lang.id === 'other') {
      onChange('en'); // Default to English for 'other'
    } else {
      // 重要：始终传递 lang.id (小写格式，如 'zh-cn')
      // This matches what's stored in localStorage from onboarding
      onChange(lang.id);
    }
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
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-3">
          Language / 语言
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

      {/* 使用 Portal 将下拉菜单渲染到 body，解决遮挡问题 */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* 透明遮罩层，点击外部关闭菜单 */}
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
              minWidth: `${Math.max(dropdownPosition.width, 200)}px`, // 确保最小宽度
            }}
          >
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
                      <span className="font-medium leading-none mb-0.5">{lang.label}</span>
                      {lang.nativeLabel && lang.nativeLabel !== lang.label && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                          {lang.nativeLabel}
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
        document.body // 渲染目标节点
      )}
    </div>
  );
}
