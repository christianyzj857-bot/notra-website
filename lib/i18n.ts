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
  // Priority: ui_language > onboarding_content_language > default 'en'
  const uiLang = localStorage.getItem('ui_language') ||
                 localStorage.getItem('onboarding_content_language') ||
                 'en';

  // Handle 'other' option - default to English
  if (uiLang === 'other') {
    return 'en';
  }

  return uiLang;
}

// Get nested value from object by path (e.g., "dashboard.title")
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

// Get translation text
export function t(key: string, params?: Record<string, string>): string {
  const lang = getUILanguage();

  try {
    const translations = getTranslations(lang);
    
    // Support nested keys like "dashboard.title"
    let text = getNestedValue(translations, key) || key;

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

// Import all translation files statically
import enTranslations from '@/locales/en/common.json';
import zhCNTranslations from '@/locales/zh-CN/common.json';
import zhTWTranslations from '@/locales/zh-TW/common.json';
import esTranslations from '@/locales/es/common.json';
import frTranslations from '@/locales/fr/common.json';
import deTranslations from '@/locales/de/common.json';
import jaTranslations from '@/locales/ja/common.json';
import koTranslations from '@/locales/ko/common.json';
import ptTranslations from '@/locales/pt/common.json';
import ruTranslations from '@/locales/ru/common.json';
import hiTranslations from '@/locales/hi/common.json';
import arTranslations from '@/locales/ar/common.json';
import itTranslations from '@/locales/it/common.json';
import nlTranslations from '@/locales/nl/common.json';
import plTranslations from '@/locales/pl/common.json';
import trTranslations from '@/locales/tr/common.json';
import viTranslations from '@/locales/vi/common.json';
import thTranslations from '@/locales/th/common.json';
import idTranslations from '@/locales/id/common.json';
import msTranslations from '@/locales/ms/common.json';

// Translation cache
const translationCache: Record<string, Record<string, any>> = {};

// Language code mapping: onboarding language id -> translation file key
const LANGUAGE_MAP: Record<string, string> = {
  'en': 'en',
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'ja': 'ja',
  'ko': 'ko',
  'pt': 'pt',
  'ru': 'ru',
  'hi': 'hi',
  'ar': 'ar',
  'it': 'it',
  'nl': 'nl',
  'pl': 'pl',
  'tr': 'tr',
  'vi': 'vi',
  'th': 'th',
  'id': 'id',
  'ms': 'ms',
  'other': 'en', // 'other' defaults to English
};

// Get translations for a language
function getTranslations(lang: string): Record<string, any> {
  // Normalize language code using mapping
  const normalizedLang = LANGUAGE_MAP[lang.toLowerCase()] || lang || 'en';
  
  // Check cache first
  if (translationCache[normalizedLang]) {
    return translationCache[normalizedLang];
  }

  let translations: Record<string, any> = {};
  
  try {
    // Use static imports for all languages
    switch (normalizedLang) {
      case 'zh-CN':
        translations = zhCNTranslations as any;
        break;
      case 'zh-TW':
        translations = zhTWTranslations as any;
        break;
      case 'es':
        translations = esTranslations as any;
        break;
      case 'fr':
        translations = frTranslations as any;
        break;
      case 'de':
        translations = deTranslations as any;
        break;
      case 'ja':
        translations = jaTranslations as any;
        break;
      case 'ko':
        translations = koTranslations as any;
        break;
      case 'pt':
        translations = ptTranslations as any;
        break;
      case 'ru':
        translations = ruTranslations as any;
        break;
      case 'hi':
        translations = hiTranslations as any;
        break;
      case 'ar':
        translations = arTranslations as any;
        break;
      case 'it':
        translations = itTranslations as any;
        break;
      case 'nl':
        translations = nlTranslations as any;
        break;
      case 'pl':
        translations = plTranslations as any;
        break;
      case 'tr':
        translations = trTranslations as any;
        break;
      case 'vi':
        translations = viTranslations as any;
        break;
      case 'th':
        translations = thTranslations as any;
        break;
      case 'id':
        translations = idTranslations as any;
        break;
      case 'ms':
        translations = msTranslations as any;
        break;
      case 'en':
      default:
        translations = enTranslations as any;
        break;
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
    return enTranslations as any;
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

