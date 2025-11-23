// Language detection utility
// Uses a simple heuristic-based approach (can be enhanced with ML models later)

/**
 * Detect the primary language of a text
 * Returns ISO 639-1 language code (e.g., 'en', 'zh', 'es')
 */
export function detectLanguage(text: string): string {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }

  // Sample text for detection (first 500 chars for efficiency)
  const sample = text.substring(0, 500).toLowerCase();

  // Chinese detection (Simplified and Traditional)
  const chinesePattern = /[\u4e00-\u9fff]/;
  if (chinesePattern.test(sample)) {
    // Try to distinguish Simplified vs Traditional
    // Simplified: 简体字更常见
    // Traditional: 繁體字更常见
    // For now, default to Simplified Chinese
    return 'zh-CN';
  }

  // Japanese detection
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  if (japanesePattern.test(sample)) {
    return 'ja';
  }

  // Korean detection
  const koreanPattern = /[\uac00-\ud7a3]/;
  if (koreanPattern.test(sample)) {
    return 'ko';
  }

  // Arabic detection
  const arabicPattern = /[\u0600-\u06ff]/;
  if (arabicPattern.test(sample)) {
    return 'ar';
  }

  // Russian/Cyrillic detection
  const cyrillicPattern = /[\u0400-\u04ff]/;
  if (cyrillicPattern.test(sample)) {
    return 'ru';
  }

  // Spanish detection (common words)
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para'];
  const spanishCount = spanishWords.filter(word => sample.includes(` ${word} `)).length;
  if (spanishCount >= 3) {
    return 'es';
  }

  // French detection (common words)
  const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se'];
  const frenchCount = frenchWords.filter(word => sample.includes(` ${word} `)).length;
  if (frenchCount >= 3) {
    return 'fr';
  }

  // German detection (common words)
  const germanWords = ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als'];
  const germanCount = germanWords.filter(word => sample.includes(` ${word} `)).length;
  if (germanCount >= 3) {
    return 'de';
  }

  // Portuguese detection (common words)
  const portugueseWords = ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as'];
  const portugueseCount = portugueseWords.filter(word => sample.includes(` ${word} `)).length;
  if (portugueseCount >= 3) {
    return 'pt';
  }

  // Default to English
  return 'en';
}

/**
 * Get language name from ISO code
 */
export function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ja': '日本語',
    'ko': '한국어',
    'pt': 'Português',
    'ru': 'Русский',
    'ar': 'العربية',
    'it': 'Italiano',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'tr': 'Türkçe',
    'vi': 'Tiếng Việt',
    'th': 'ไทย',
    'hi': 'हिन्दी',
  };
  return languageMap[code] || code;
}

/**
 * Get localized prompt based on language
 */
export function getLocalizedPrompt(language: string, contentType: 'file' | 'audio' | 'video' = 'file'): string {
  const basePrompts: Record<string, Record<string, string>> = {
    'en': {
      file: `You are an AI learning assistant. Analyze the following content and generate structured study materials in English.

Content:
{content}

Please return a JSON object with the following structure:
{
  "title": "A concise title for this content",
  "notes": [
    {
      "id": "note-1",
      "heading": "Section heading",
      "content": "Main content paragraph",
      "bullets": ["Key point 1", "Key point 2"],
      "example": "Optional example",
      "tableSummary": [{"label": "Term", "value": "Definition"}]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Question text",
      "options": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}, {"label": "C", "text": "Option C"}, {"label": "D", "text": "Option D"}],
      "correctIndex": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "easy"
    }
  ],
  "flashcards": [
    {
      "id": "card-1",
      "front": "Question or term",
      "back": "Answer or definition",
      "tag": "Category"
    }
  ],
  "summaryForChat": "A concise 2-3 sentence summary of the key concepts for chat context"
}

Generate 4-6 note sections, 3-5 quiz questions, and 4-6 flashcards. All content must be in English.`,
      audio: `You are an AI learning assistant. Analyze the following transcribed lecture/audio content and generate structured study materials in English.

Transcribed Content:
{content}

[Same JSON structure as above]

Generate 4-6 note sections, 3-5 quiz questions, and 4-6 flashcards. All content must be in English.`,
      video: `You are an AI learning assistant. Analyze the following video transcript and generate structured study materials in English.

Video Transcript:
{content}

[Same JSON structure as above]

Generate 4-6 note sections, 3-5 quiz questions, and 4-6 flashcards. All content must be in English.`,
    },
    'zh-CN': {
      file: `你是一个AI学习助手。请分析以下内容并用简体中文生成结构化的学习材料。

内容：
{content}

请返回以下结构的JSON对象：
{
  "title": "内容的简洁标题",
  "notes": [
    {
      "id": "note-1",
      "heading": "章节标题",
      "content": "主要内容段落",
      "bullets": ["要点1", "要点2"],
      "example": "可选示例",
      "tableSummary": [{"label": "术语", "value": "定义"}]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "问题文本",
      "options": [{"label": "A", "text": "选项A"}, {"label": "B", "text": "选项B"}, {"label": "C", "text": "选项C"}, {"label": "D", "text": "选项D"}],
      "correctIndex": 0,
      "explanation": "为什么这个答案是正确的",
      "difficulty": "easy"
    }
  ],
  "flashcards": [
    {
      "id": "card-1",
      "front": "问题或术语",
      "back": "答案或定义",
      "tag": "类别"
    }
  ],
  "summaryForChat": "关键概念的2-3句话摘要，用于聊天上下文"
}

生成4-6个笔记章节、3-5个测验问题和4-6张闪卡。所有内容必须使用简体中文。`,
      audio: `你是一个AI学习助手。请分析以下转录的讲座/音频内容并用简体中文生成结构化的学习材料。

转录内容：
{content}

[相同的JSON结构]

生成4-6个笔记章节、3-5个测验问题和4-6张闪卡。所有内容必须使用简体中文。`,
      video: `你是一个AI学习助手。请分析以下视频转录并用简体中文生成结构化的学习材料。

视频转录：
{content}

[相同的JSON结构]

生成4-6个笔记章节、3-5个测验问题和4-6张闪卡。所有内容必须使用简体中文。`,
    },
  };

  // Default to English if language not supported
  const prompts = basePrompts[language] || basePrompts['en'];
  return prompts[contentType] || prompts['file'];
}

