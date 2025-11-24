// Global country/region list for onboarding
export interface Country {
  id: string;
  label: string;
  code?: string; // ISO country code if needed
  nativeLabel?: string; // Native name of the country (e.g., "中国" for China)
}

export const COUNTRIES: Country[] = [
  // Major English-speaking countries (prioritized)
  { id: 'uk', label: 'United Kingdom', code: 'GB' },
  { id: 'us', label: 'United States', code: 'US' },
  { id: 'canada', label: 'Canada', code: 'CA' },
  { id: 'australia', label: 'Australia', code: 'AU' },
  { id: 'newzealand', label: 'New Zealand', code: 'NZ' },
  { id: 'ireland', label: 'Ireland', code: 'IE' },
  
  // Asia-Pacific
  { id: 'china', label: 'China', code: 'CN' },
  { id: 'china-hongkong', label: 'China · Hong Kong', code: 'HK' },
  { id: 'china-macao', label: 'China · Macao', code: 'MO' },
  { id: 'china-taiwan', label: 'China · Taiwan (Taipei)', code: 'TW' },
  { id: 'japan', label: 'Japan', code: 'JP' },
  { id: 'southkorea', label: 'South Korea', code: 'KR' },
  { id: 'singapore', label: 'Singapore', code: 'SG' },
  { id: 'india', label: 'India', code: 'IN' },
  { id: 'malaysia', label: 'Malaysia', code: 'MY' },
  { id: 'thailand', label: 'Thailand', code: 'TH' },
  { id: 'vietnam', label: 'Vietnam', code: 'VN' },
  { id: 'indonesia', label: 'Indonesia', code: 'ID' },
  { id: 'philippines', label: 'Philippines', code: 'PH' },
  
  // Europe
  { id: 'germany', label: 'Germany', code: 'DE' },
  { id: 'france', label: 'France', code: 'FR' },
  { id: 'italy', label: 'Italy', code: 'IT' },
  { id: 'spain', label: 'Spain', code: 'ES' },
  { id: 'netherlands', label: 'Netherlands', code: 'NL' },
  { id: 'belgium', label: 'Belgium', code: 'BE' },
  { id: 'switzerland', label: 'Switzerland', code: 'CH' },
  { id: 'austria', label: 'Austria', code: 'AT' },
  { id: 'sweden', label: 'Sweden', code: 'SE' },
  { id: 'norway', label: 'Norway', code: 'NO' },
  { id: 'denmark', label: 'Denmark', code: 'DK' },
  { id: 'finland', label: 'Finland', code: 'FI' },
  { id: 'poland', label: 'Poland', code: 'PL' },
  { id: 'portugal', label: 'Portugal', code: 'PT' },
  { id: 'greece', label: 'Greece', code: 'GR' },
  { id: 'russia', label: 'Russia', code: 'RU' },
  { id: 'turkey', label: 'Turkey', code: 'TR' },
  
  // Middle East
  { id: 'uae', label: 'United Arab Emirates', code: 'AE' },
  { id: 'saudiarabia', label: 'Saudi Arabia', code: 'SA' },
  { id: 'israel', label: 'Israel', code: 'IL' },
  
  // Americas
  { id: 'mexico', label: 'Mexico', code: 'MX' },
  { id: 'brazil', label: 'Brazil', code: 'BR' },
  { id: 'argentina', label: 'Argentina', code: 'AR' },
  { id: 'chile', label: 'Chile', code: 'CL' },
  { id: 'colombia', label: 'Colombia', code: 'CO' },
  
  // Africa
  { id: 'southafrica', label: 'South Africa', code: 'ZA' },
  { id: 'egypt', label: 'Egypt', code: 'EG' },
  { id: 'nigeria', label: 'Nigeria', code: 'NG' },
  { id: 'kenya', label: 'Kenya', code: 'KE' },
  
  // Other
  { id: 'other', label: 'Other', code: 'XX' },
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

