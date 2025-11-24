'use client';

// Simple language test page
// Access at /test-language

import React, { useState, useEffect } from 'react';
import { LANGUAGES } from '@/constants/languages';
import { t, getUILanguage } from '@/lib/i18n';

export default function TestLanguagePage() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [allStorage, setAllStorage] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lang = getUILanguage();
      setCurrentLang(lang);
      
      // Get all language-related localStorage
      const storage: Record<string, string> = {};
      storage['ui_language'] = localStorage.getItem('ui_language') || 'null';
      storage['content_language'] = localStorage.getItem('content_language') || 'null';
      storage['onboarding_content_language'] = localStorage.getItem('onboarding_content_language') || 'null';
      setAllStorage(storage);
    }
  }, []);

  const setLanguage = (langCode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ui_language', langCode);
      localStorage.setItem('content_language', langCode);
      localStorage.setItem('onboarding_content_language', langCode);
      setCurrentLang(langCode);
      alert(`Language set to: ${langCode}\nPage will reload...`);
      window.location.reload();
    }
  };

  const testTranslation = (key: string) => {
    return t(key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Language Test Tool</h1>
        
        {/* Current Status */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Current Language:</strong> <code className="bg-slate-100 px-2 py-1 rounded">{currentLang}</code></p>
            <p><strong>UI Language:</strong> <code className="bg-slate-100 px-2 py-1 rounded">{allStorage.ui_language}</code></p>
            <p><strong>Content Language:</strong> <code className="bg-slate-100 px-2 py-1 rounded">{allStorage.content_language}</code></p>
            <p><strong>Onboarding Language:</strong> <code className="bg-slate-100 px-2 py-1 rounded">{allStorage.onboarding_content_language}</code></p>
          </div>
        </div>

        {/* Test Translation */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Translation</h2>
          <div className="space-y-2">
            <p><strong>dashboard.title:</strong> {testTranslation('dashboard.title')}</p>
            <p><strong>dashboard.createNew:</strong> {testTranslation('dashboard.createNew')}</p>
            <p><strong>settings.title:</strong> {testTranslation('settings.title')}</p>
            <p><strong>buttons.upload:</strong> {testTranslation('buttons.upload')}</p>
          </div>
        </div>

        {/* Quick Set Language */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Set Language</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LANGUAGES.filter(l => l.id !== 'other').slice(0, 8).map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentLang === lang.id || currentLang === lang.code
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="font-semibold">{lang.label}</div>
                <div className="text-xs text-slate-500">{lang.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* All Languages */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">All Languages</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {LANGUAGES.filter(l => l.id !== 'other').map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  currentLang === lang.id || currentLang === lang.code
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="font-semibold text-sm">{lang.label}</div>
                <div className="text-xs text-slate-500">{lang.id}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-indigo-600 hover:underline">Go to Dashboard</a>
          {' | '}
          <a href="/settings" className="text-indigo-600 hover:underline">Go to Settings</a>
        </div>
      </div>
    </div>
  );
}

