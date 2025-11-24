// Language Provider Component
// Monitors language changes and triggers re-render

'use client';

import { useEffect, useState } from 'react';
import { getUILanguage } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    // Get initial language
    const currentLang = getUILanguage();
    setLanguage(currentLang);

    // Listen for language changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ui_language' || e.key === 'onboarding_content_language') {
        const newLang = getUILanguage();
        setLanguage(newLang);
        // Force re-render by reloading page
        window.location.reload();
      }
    };

    // Listen for custom language change event
    const handleLanguageChange = () => {
      const newLang = getUILanguage();
      setLanguage(newLang);
      window.location.reload();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  return language;
}

