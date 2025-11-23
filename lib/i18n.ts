// i18n utility functions
// Handles UI language switching with proper scope control

// Pages that should ALWAYS remain in English (no localization)
const ENGLISH_ONLY_PATHS = [
  '/',                    // Homepage
  '/onboarding',          // All onboarding pages
  '/pricing',             // Pricing page (slogan stays English)
];

// Check if current page should be localized
export function shouldLocalize(pathname?: string): boolean {
  if (typeof window === 'undefined') {
    // Server-side: default to true (will be checked on client)
    return true;
  }

  const path = pathname || window.location.pathname;

  // Check if path starts with any English-only path
  for (const englishPath of ENGLISH_ONLY_PATHS) {
    if (path.startsWith(englishPath)) {
      return false; // Don't localize
    }
  }

  return true; // Localize
}

// Get user's UI language preference
export function getUILanguage(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }

  // If current page shouldn't be localized, always return English
  if (!shouldLocalize()) {
    return 'en';
  }

  // Get language from localStorage
  const uiLang = localStorage.getItem('ui_language') ||
                 localStorage.getItem('onboarding_content_language') ||
                 'en';

  // Handle 'other' option - default to English
  if (uiLang === 'other') {
    return 'en';
  }

  return uiLang;
}

// Get translation text
export function t(key: string, params?: Record<string, string>): string {
  const lang = getUILanguage();

  try {
    // Dynamically import translation file
    // For now, we'll use a simple mapping approach
    // In production, you might want to use dynamic imports
    const translations = getTranslations(lang);
    let text = translations[key] || key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }

    return text;
  } catch (error) {
    console.warn(`Translation not found for key: ${key}, language: ${lang}`);
    return key; // Fallback to key
  }
}

// Translation cache
const translationCache: Record<string, Record<string, string>> = {};

// Get translations for a language
function getTranslations(lang: string): Record<string, string> {
  // Normalize language code
  const normalizedLang = lang === 'zh-cn' ? 'zh-CN' : 
                         lang === 'zh-tw' ? 'zh-TW' :
                         lang === 'other' ? 'en' : lang;
  
  // Check cache first
  if (translationCache[normalizedLang]) {
    return translationCache[normalizedLang];
  }

  try {
    let translations: Record<string, string> = {};
    
    if (typeof window !== 'undefined') {
      // Client-side: use dynamic import with try-catch
      try {
        // Use dynamic import for client-side
        // For Next.js, we'll use a synchronous require approach
        // This works because webpack will bundle the JSON files
        const translationModule = require(`@/locales/${normalizedLang}/common.json`);
        translations = translationModule.default || translationModule;
      } catch (e) {
        // Fallback to English if translation file doesn't exist
        if (normalizedLang !== 'en') {
          try {
            const fallbackModule = require('@/locales/en/common.json');
            translations = fallbackModule.default || fallbackModule;
          } catch (fallbackError) {
            console.warn('Failed to load English translations');
            return {};
          }
        } else {
          return {};
        }
      }
    } else {
      // Server-side: use fs
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'locales', normalizedLang, 'common.json');
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          translations = JSON.parse(fileContent);
        } else {
          throw new Error('File not found');
        }
      } catch (e) {
        // Fallback to English
        if (normalizedLang !== 'en') {
          try {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(process.cwd(), 'locales', 'en', 'common.json');
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            translations = JSON.parse(fileContent);
          } catch (fallbackError) {
            console.warn('Failed to load English translations on server');
            return {};
          }
        } else {
          return {};
        }
      }
    }

    // Cache translations
    translationCache[normalizedLang] = translations;
    return translations;
  } catch (error) {
    console.warn(`Failed to load translations for ${normalizedLang}, falling back to English`);
    // Fallback to English
    if (normalizedLang !== 'en') {
      return getTranslations('en');
    }
    return {};
  }
}

// Get logo text (always English - brand name)
export function getLogoText(): string {
  return 'Notra'; // Always English, brand name
}

// Format language code for display
export function formatLanguageCode(code: string): string {
  const langMap: Record<string, string> = {
    'en': 'EN',
    'zh-CN': '中文',
    'zh-TW': '繁體',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE',
    'ja': '日本語',
    'ko': '한국어',
    'pt': 'PT',
    'ru': 'RU',
    'hi': 'HI',
    'ar': 'AR',
    'it': 'IT',
    'nl': 'NL',
    'pl': 'PL',
    'tr': 'TR',
    'vi': 'VI',
    'th': 'TH',
    'id': 'ID',
    'ms': 'MS',
  };
  return langMap[code] || code.toUpperCase();
}

