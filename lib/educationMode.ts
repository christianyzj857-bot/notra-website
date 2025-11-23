// Education mode system
// Different countries/regions have different educational styles

export type EducationMode = 
  | 'asian'      // 亚洲教育模式：注重基础、记忆、考试导向
  | 'western'    // 欧美教育模式：注重理解、批判性思维、应用
  | 'mixed';     // 混合模式（如新加坡、香港等）

export interface CountryEducationMapping {
  countryId: string;
  educationMode: EducationMode;
  region?: 'asia' | 'europe' | 'americas' | 'middle-east' | 'africa' | 'oceania';
}

/**
 * 国家到教育模式的映射
 * 基于实际的教育体系特点
 */
export const COUNTRY_EDUCATION_MAP: CountryEducationMapping[] = [
  // 亚洲教育模式（注重基础、记忆、考试导向）
  { countryId: 'china', educationMode: 'asian', region: 'asia' },
  { countryId: 'china-hongkong', educationMode: 'mixed', region: 'asia' },
  { countryId: 'china-macao', educationMode: 'mixed', region: 'asia' },
  { countryId: 'china-taiwan', educationMode: 'asian', region: 'asia' },
  { countryId: 'japan', educationMode: 'asian', region: 'asia' },
  { countryId: 'southkorea', educationMode: 'asian', region: 'asia' },
  { countryId: 'india', educationMode: 'asian', region: 'asia' },
  { countryId: 'thailand', educationMode: 'asian', region: 'asia' },
  { countryId: 'vietnam', educationMode: 'asian', region: 'asia' },
  { countryId: 'indonesia', educationMode: 'asian', region: 'asia' },
  { countryId: 'philippines', educationMode: 'mixed', region: 'asia' },
  
  // 混合模式（受西方影响但保留亚洲特色）
  { countryId: 'singapore', educationMode: 'mixed', region: 'asia' },
  { countryId: 'malaysia', educationMode: 'mixed', region: 'asia' },
  
  // 欧美教育模式（注重理解、批判性思维、应用）
  { countryId: 'us', educationMode: 'western', region: 'americas' },
  { countryId: 'uk', educationMode: 'western', region: 'europe' },
  { countryId: 'canada', educationMode: 'western', region: 'americas' },
  { countryId: 'australia', educationMode: 'western', region: 'oceania' },
  { countryId: 'newzealand', educationMode: 'western', region: 'oceania' },
  { countryId: 'ireland', educationMode: 'western', region: 'europe' },
  { countryId: 'germany', educationMode: 'western', region: 'europe' },
  { countryId: 'france', educationMode: 'western', region: 'europe' },
  { countryId: 'italy', educationMode: 'western', region: 'europe' },
  { countryId: 'spain', educationMode: 'western', region: 'europe' },
  { countryId: 'netherlands', educationMode: 'western', region: 'europe' },
  { countryId: 'belgium', educationMode: 'western', region: 'europe' },
  { countryId: 'switzerland', educationMode: 'western', region: 'europe' },
  { countryId: 'austria', educationMode: 'western', region: 'europe' },
  { countryId: 'sweden', educationMode: 'western', region: 'europe' },
  { countryId: 'norway', educationMode: 'western', region: 'europe' },
  { countryId: 'denmark', educationMode: 'western', region: 'europe' },
  { countryId: 'finland', educationMode: 'western', region: 'europe' },
  { countryId: 'poland', educationMode: 'western', region: 'europe' },
  { countryId: 'portugal', educationMode: 'western', region: 'europe' },
  { countryId: 'greece', educationMode: 'western', region: 'europe' },
  { countryId: 'mexico', educationMode: 'western', region: 'americas' },
  { countryId: 'brazil', educationMode: 'western', region: 'americas' },
  { countryId: 'argentina', educationMode: 'western', region: 'americas' },
  { countryId: 'chile', educationMode: 'western', region: 'americas' },
  { countryId: 'colombia', educationMode: 'western', region: 'americas' },
  { countryId: 'southafrica', educationMode: 'western', region: 'africa' },
  { countryId: 'egypt', educationMode: 'mixed', region: 'middle-east' },
  { countryId: 'nigeria', educationMode: 'western', region: 'africa' },
  { countryId: 'kenya', educationMode: 'western', region: 'africa' },
  { countryId: 'russia', educationMode: 'mixed', region: 'europe' },
  { countryId: 'turkey', educationMode: 'mixed', region: 'middle-east' },
  { countryId: 'uae', educationMode: 'mixed', region: 'middle-east' },
  { countryId: 'saudiarabia', educationMode: 'mixed', region: 'middle-east' },
  { countryId: 'israel', educationMode: 'western', region: 'middle-east' },
  
  // 默认
  { countryId: 'other', educationMode: 'western', region: 'europe' },
];

/**
 * 根据国家 ID 获取教育模式
 */
export function getEducationModeByCountry(countryId: string): EducationMode {
  const mapping = COUNTRY_EDUCATION_MAP.find(m => m.countryId === countryId);
  return mapping?.educationMode || 'western'; // 默认西方模式
}

/**
 * 获取教育模式的描述
 */
export function getEducationModeDescription(mode: EducationMode, language: string = 'en'): string {
  const descriptions: Record<EducationMode, Record<string, string>> = {
    asian: {
      en: 'Asian Education Style: Focus on fundamentals, memorization, and exam-oriented learning',
      'zh-CN': '亚洲教育模式：注重基础、记忆和考试导向的学习',
      'zh-TW': '亞洲教育模式：注重基礎、記憶和考試導向的學習',
    },
    western: {
      en: 'Western Education Style: Focus on understanding, critical thinking, and practical application',
      'zh-CN': '欧美教育模式：注重理解、批判性思维和实践应用',
      'zh-TW': '歐美教育模式：注重理解、批判性思維和實踐應用',
    },
    mixed: {
      en: 'Mixed Education Style: Combines Asian fundamentals with Western critical thinking',
      'zh-CN': '混合教育模式：结合亚洲基础和西方批判性思维',
      'zh-TW': '混合教育模式：結合亞洲基礎和西方批判性思維',
    },
  };
  
  return descriptions[mode]?.[language] || descriptions[mode].en;
}

/**
 * 根据教育模式生成不同的 prompt 风格
 */
export function getEducationModePrompt(mode: EducationMode, language: string): string {
  const prompts: Record<EducationMode, Record<string, string>> = {
    asian: {
      en: `Generate notes in Asian education style:
- Emphasize fundamental concepts and definitions
- Focus on memorization-friendly formats (formulas, key terms, step-by-step procedures)
- Include exam-oriented practice questions
- Structure content for efficient review and recall
- Highlight important points that are commonly tested`,
      'zh-CN': `以亚洲教育模式生成笔记：
- 强调基础概念和定义
- 注重便于记忆的格式（公式、关键词、步骤）
- 包含考试导向的练习题
- 结构化的内容便于复习和回忆
- 突出常考重点`,
      'zh-TW': `以亞洲教育模式生成筆記：
- 強調基礎概念和定義
- 注重便於記憶的格式（公式、關鍵詞、步驟）
- 包含考試導向的練習題
- 結構化的內容便於複習和回憶
- 突出常考重點`,
    },
    western: {
      en: `Generate notes in Western education style:
- Emphasize understanding and conceptual connections
- Focus on critical thinking and analysis
- Include real-world applications and examples
- Encourage questioning and exploration
- Structure content to promote deeper understanding rather than memorization`,
      'zh-CN': `以欧美教育模式生成笔记：
- 强调理解和概念联系
- 注重批判性思维和分析
- 包含实际应用和案例
- 鼓励提问和探索
- 结构化内容以促进深度理解而非记忆`,
      'zh-TW': `以歐美教育模式生成筆記：
- 強調理解和概念聯繫
- 注重批判性思維和分析
- 包含實際應用和案例
- 鼓勵提問和探索
- 結構化內容以促進深度理解而非記憶`,
    },
    mixed: {
      en: `Generate notes in Mixed education style:
- Combine solid fundamentals with critical thinking
- Balance memorization with understanding
- Include both exam practice and real-world applications
- Structure content for both review and deep learning`,
      'zh-CN': `以混合教育模式生成笔记：
- 结合扎实的基础和批判性思维
- 平衡记忆和理解
- 包含考试练习和实际应用
- 结构化内容兼顾复习和深度学习`,
      'zh-TW': `以混合教育模式生成筆記：
- 結合紮實的基礎和批判性思維
- 平衡記憶和理解
- 包含考試練習和實際應用
- 結構化內容兼顧複習和深度學習`,
    },
  };
  
  return prompts[mode]?.[language] || prompts[mode].en;
}

