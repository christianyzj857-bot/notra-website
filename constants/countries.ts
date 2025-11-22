// Global country/region list for onboarding
export interface Country {
  id: string;
  label: string;
  flag: string;
  code?: string; // ISO country code if needed
}

export const COUNTRIES: Country[] = [
  // Major English-speaking countries (prioritized)
  { id: 'uk', label: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { id: 'us', label: 'United States', flag: '🇺🇸', code: 'US' },
  { id: 'canada', label: 'Canada', flag: '🇨🇦', code: 'CA' },
  { id: 'australia', label: 'Australia', flag: '🇦🇺', code: 'AU' },
  { id: 'newzealand', label: 'New Zealand', flag: '🇳🇿', code: 'NZ' },
  { id: 'ireland', label: 'Ireland', flag: '🇮🇪', code: 'IE' },
  
  // Asia-Pacific
  { id: 'china', label: 'China', flag: '/flags/china.svg', code: 'CN' },
  { id: 'china-hongkong', label: 'China · Hong Kong', flag: '/flags/hongkong.svg', code: 'HK' },
  { id: 'china-macao', label: 'China · Macao', flag: '/flags/macao.svg', code: 'MO' },
  { id: 'china-taiwan', label: 'China · Taiwan (Taipei)', flag: '/flags/taiwan-blossom.svg', code: 'TW' },
  { id: 'japan', label: 'Japan', flag: '🇯🇵', code: 'JP' },
  { id: 'southkorea', label: 'South Korea', flag: '🇰🇷', code: 'KR' },
  { id: 'singapore', label: 'Singapore', flag: '🇸🇬', code: 'SG' },
  { id: 'india', label: 'India', flag: '🇮🇳', code: 'IN' },
  { id: 'malaysia', label: 'Malaysia', flag: '🇲🇾', code: 'MY' },
  { id: 'thailand', label: 'Thailand', flag: '🇹🇭', code: 'TH' },
  { id: 'vietnam', label: 'Vietnam', flag: '🇻🇳', code: 'VN' },
  { id: 'indonesia', label: 'Indonesia', flag: '🇮🇩', code: 'ID' },
  { id: 'philippines', label: 'Philippines', flag: '🇵🇭', code: 'PH' },
  
  // Europe
  { id: 'germany', label: 'Germany', flag: '🇩🇪', code: 'DE' },
  { id: 'france', label: 'France', flag: '🇫🇷', code: 'FR' },
  { id: 'italy', label: 'Italy', flag: '🇮🇹', code: 'IT' },
  { id: 'spain', label: 'Spain', flag: '🇪🇸', code: 'ES' },
  { id: 'netherlands', label: 'Netherlands', flag: '🇳🇱', code: 'NL' },
  { id: 'belgium', label: 'Belgium', flag: '🇧🇪', code: 'BE' },
  { id: 'switzerland', label: 'Switzerland', flag: '🇨🇭', code: 'CH' },
  { id: 'austria', label: 'Austria', flag: '🇦🇹', code: 'AT' },
  { id: 'sweden', label: 'Sweden', flag: '🇸🇪', code: 'SE' },
  { id: 'norway', label: 'Norway', flag: '🇳🇴', code: 'NO' },
  { id: 'denmark', label: 'Denmark', flag: '🇩🇰', code: 'DK' },
  { id: 'finland', label: 'Finland', flag: '🇫🇮', code: 'FI' },
  { id: 'poland', label: 'Poland', flag: '🇵🇱', code: 'PL' },
  { id: 'portugal', label: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { id: 'greece', label: 'Greece', flag: '🇬🇷', code: 'GR' },
  { id: 'russia', label: 'Russia', flag: '🇷🇺', code: 'RU' },
  { id: 'turkey', label: 'Turkey', flag: '🇹🇷', code: 'TR' },
  
  // Middle East
  { id: 'uae', label: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
  { id: 'saudiarabia', label: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { id: 'israel', label: 'Israel', flag: '🇮🇱', code: 'IL' },
  
  // Americas
  { id: 'mexico', label: 'Mexico', flag: '🇲🇽', code: 'MX' },
  { id: 'brazil', label: 'Brazil', flag: '🇧🇷', code: 'BR' },
  { id: 'argentina', label: 'Argentina', flag: '🇦🇷', code: 'AR' },
  { id: 'chile', label: 'Chile', flag: '🇨🇱', code: 'CL' },
  { id: 'colombia', label: 'Colombia', flag: '🇨🇴', code: 'CO' },
  
  // Africa
  { id: 'southafrica', label: 'South Africa', flag: '🇿🇦', code: 'ZA' },
  { id: 'egypt', label: 'Egypt', flag: '🇪🇬', code: 'EG' },
  { id: 'nigeria', label: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { id: 'kenya', label: 'Kenya', flag: '🇰🇪', code: 'KE' },
  
  // Other
  { id: 'other', label: 'Other', flag: '🌍', code: 'XX' },
];

// Helper function to search countries
export function searchCountries(query: string): Country[] {
  if (!query.trim()) {
    return COUNTRIES;
  }
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(country => 
    country.label.toLowerCase().includes(lowerQuery) ||
    country.code?.toLowerCase().includes(lowerQuery)
  );
}

