// Debug helper for i18n
// Add this to browser console to debug language issues

export function debugI18n() {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }

  const uiLang = localStorage.getItem('ui_language');
  const contentLang = localStorage.getItem('content_language');
  const onboardingLang = localStorage.getItem('onboarding_content_language');
  
  console.log('=== i18n Debug Info ===');
  console.log('ui_language:', uiLang);
  console.log('content_language:', contentLang);
  console.log('onboarding_content_language:', onboardingLang);
  console.log('Current pathname:', window.location.pathname);
  
  // Test getUILanguage
  const { getUILanguage, t } = require('./i18n');
  const currentLang = getUILanguage();
  console.log('getUILanguage() returns:', currentLang);
  
  // Test translation
  const testKey = 'dashboard.title';
  const translation = t(testKey);
  console.log(`t('${testKey}') returns:`, translation);
  
  return {
    uiLang,
    contentLang,
    onboardingLang,
    currentLang,
    translation,
  };
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugI18n = debugI18n;
}

