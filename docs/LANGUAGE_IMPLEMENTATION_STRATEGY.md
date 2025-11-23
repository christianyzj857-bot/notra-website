# Notra 网站语言实施策略

## 📋 目录
1. [总体架构](#总体架构)
2. [语言系统设计](#语言系统设计)
3. [技术选型](#技术选型)
4. [实施阶段](#实施阶段)
5. [详细实施步骤](#详细实施步骤)
6. [文件结构](#文件结构)
7. [数据流](#数据流)
8. [成本分析](#成本分析)
9. [风险评估](#风险评估)

---

## 🏗️ 总体架构

### 三层系统设计

Notra 采用**三层系统设计**，分别处理 UI 界面语言、内容生成语言和教育模式：

```
┌─────────────────────────────────────────┐
│         用户设置系统                     │
├─────────────────────────────────────────┤
│  1. UI Language (界面语言)              │
│     - 导航栏、按钮、表单标签              │
│     - 错误消息、提示文本                  │
│     - 设置页面、帮助文档                  │
│     - 存储: localStorage['ui_language'] │
│                                          │
│  2. Content Language (内容语言)         │
│     - AI 生成的 notes                   │
│     - Quiz 问题和选项                    │
│     - Flashcards 内容                    │
│     - Chat 对话语言                      │
│     - 存储: localStorage['content_language'] │
│                                          │
│  3. Education Mode (教育模式)           │
│     - 亚洲模式: 基础、记忆、考试导向      │
│     - 欧美模式: 理解、批判性思维、应用    │
│     - 混合模式: 结合两者优势              │
│     - 存储: localStorage['education_mode'] │
│     - 来源: 国家/地区选择                 │
└─────────────────────────────────────────┘
```

### 数据存储位置

**localStorage**:
- `ui_language`: UI 界面语言 (可在 Settings 修改)
- `content_language`: 内容生成语言 (可在 Settings 修改)
- `onboarding_country`: 用户选择的国家 (影响教育模式)
- `education_mode`: 教育模式 (从国家自动推断，可在 Settings 修改)

**Session 对象**:
- `detectedLanguage`: 自动检测的内容语言
- `generatedLanguage`: 实际生成的 notes 语言
- `educationMode`: 生成 notes 时使用的教育模式
- `originalText`: 原始文本 (用于重新生成)

---

## 🎯 语言系统设计

### 1. UI 界面语言 (Interface Language)

**用途**: 控制网站界面显示的语言

**存储位置**: 
- `localStorage.getItem('ui_language')` 或从 `onboarding_content_language` 继承

**影响范围**:
- ✅ Dashboard 页面所有文本
- ✅ Chat 界面的欢迎消息、占位符、按钮
- ✅ Settings 页面所有选项和标签
- ✅ Upload 页面的说明文字、按钮、提示
- ✅ 错误消息和提示（除 Homepage 外）
- ✅ 导航栏（除 Homepage 外）

**保持英文不变** (品牌一致性):
- ❌ **Onboarding 流程**: 所有 onboarding 页面保持英文
- ❌ **Homepage** (`app/page.tsx`): 整个首页保持英文
- ❌ **Logo 文字**: Logo 旁边的 "Notra" 文字保持英文（品牌名）
- ❌ **Pricing 页面 Slogan**: 
  - "Notes for a new era of learning"
  - "Notra helps you turn lectures, PDFs, and messy ideas into clean study notes, quizzes, and flashcards – in seconds."
  - 这些核心 slogan 保持英文，但其他内容（如按钮、描述）可以本地化

### 2. 内容生成语言 (Content Language)

**用途**: 控制 AI 生成的学习材料语言

**工作流程**:
```
上传文件/录音/视频
    ↓
自动检测内容语言 (detectLanguage)
    ↓
生成对应语言的 notes
    ↓
用户可在 notes 界面切换语言
    ↓
重新生成新语言的 notes
```

**影响范围**:
- ✅ Notes 的所有内容 (标题、段落、要点)
- ✅ Quiz 问题和选项
- ✅ Flashcards 正反面
- ✅ Chat 对话的 AI 回复语言

**重要原则**:
- ✅ **录音功能保持多语言识别**: Whisper API 自动检测所有语言，不限制
- ✅ **生成语言与内容一致**: 上传中文内容 → 生成中文 notes
- ✅ **支持后续切换**: 用户可在 notes 界面切换语言并重新生成

### 3. 教育模式 (Education Mode)

**用途**: 根据国家/地区调整 notes 生成风格

**三种模式**:

| 模式 | 特点 | 适用地区 | Notes 风格 |
|------|------|---------|-----------|
| **Asian** | 注重基础、记忆、考试导向 | 中国、日本、韩国、印度等 | 强调公式、定义、步骤，考试重点 |
| **Western** | 注重理解、批判性思维、应用 | 美国、英国、欧洲等 | 强调概念联系、实际应用、分析 |
| **Mixed** | 结合两者优势 | 新加坡、香港、俄罗斯等 | 平衡基础和理解 |

**工作流程**:
```
用户在 Settings 选择国家
    ↓
自动推断教育模式 (getEducationModeByCountry)
    ↓
用户可手动覆盖教育模式
    ↓
生成 notes 时使用对应模式
    ↓
影响 prompt 风格和内容结构
```

**影响范围**:
- ✅ Notes 的结构和重点
- ✅ Quiz 问题的类型 (记忆型 vs 分析型)
- ✅ Flashcards 的格式 (定义式 vs 应用式)
- ✅ 示例和案例的选择

---

## 📍 本地化范围说明

### ✅ 需要支持语言切换的页面

以下页面会根据用户选择的 UI 语言动态切换：

1. **Dashboard** (`app/dashboard/page.tsx`, `app/dashboard/[id]/page.tsx`)
   - 所有文本、按钮、标签
   - 错误消息和提示

2. **Chat 界面** (`app/chat/page.tsx`)
   - 欢迎消息
   - 占位符文本
   - 按钮和操作提示
   - 错误消息

3. **Settings 页面** (`app/settings/page.tsx`)
   - 所有设置选项
   - 标签和说明文字
   - 按钮和提示

4. **Upload 页面** (`app/upload/*/page.tsx`)
   - 上传说明
   - 按钮文本
   - 错误和成功提示

5. **Login/Signup 页面** (`app/login/page.tsx`, `app/signup/page.tsx`)
   - 表单标签
   - 按钮文本
   - 错误消息

6. **导航栏** (除 Homepage 外)
   - 导航链接文本
   - 按钮文本

### ❌ 保持英文不变的页面/元素

以下内容保持英文，不受语言设置影响：

1. **Onboarding 流程** (`app/onboarding/**`)
   - 所有 onboarding 页面保持英文
   - 原因: 保持首次体验的一致性

2. **Homepage** (`app/page.tsx`)
   - 整个首页保持英文
   - 包括: Hero section, Features, Benefits, FAQ 等所有内容
   - 原因: 品牌展示和营销内容

3. **Logo 文字** (`components/NotraLogo.tsx`)
   - Logo 旁边的 "Notra" 文字保持英文
   - 原因: 品牌名，保持一致性

4. **Pricing 页面 Slogan** (`app/pricing/page.tsx`)
   - 核心 Slogan 保持英文:
     - "Notes for a new era of learning"
     - "Notra helps you turn lectures, PDFs, and messy ideas into clean study notes, quizzes, and flashcards – in seconds."
   - 其他内容（按钮、描述等）可以本地化
   - 原因: 核心品牌信息

### 实施策略

使用 `shouldLocalize()` 函数判断当前页面是否需要本地化：

```typescript
// 在需要本地化的页面
import { t, shouldLocalize } from '@/lib/i18n';

if (shouldLocalize()) {
  // 使用翻译
  return <h1>{t('dashboard.title')}</h1>;
} else {
  // 使用硬编码英文
  return <h1>Dashboard</h1>;
}
```

---

## 🛠️ 技术选型

### 方案对比

| 方案 | 优点 | 缺点 | 成本 | 推荐度 |
|------|------|------|------|--------|
| **方案1: 简单 i18n 工具函数** | 快速实现，零依赖 | 需要手动管理翻译 | 低 | ⭐⭐⭐⭐⭐ |
| **方案2: next-intl** | 功能完整，Next.js 官方推荐 | 学习曲线，需要重构 | 中 | ⭐⭐⭐⭐ |
| **方案3: react-i18next** | 功能强大，生态丰富 | 配置复杂，体积较大 | 中 | ⭐⭐⭐ |

### 推荐方案: **混合方案**

- **Phase 1-2**: 使用简单工具函数 (快速上线)
- **Phase 3+**: 根据需求考虑升级到 next-intl

---

## 📅 实施阶段

### Phase 0: 基础设施 (最高优先级) 🏗️
**目标**: 建立语言和教育模式的基础设施

**任务清单**:
- [x] 创建语言检测工具 (`lib/languageDetection.ts`)
- [x] 创建教育模式系统 (`lib/educationMode.ts`)
- [ ] 更新 Session 类型，添加语言和教育模式字段 (`types/notra.ts`)
- [ ] 创建 Settings API 用于保存用户偏好 (`app/api/settings/route.ts`)

**预计时间**: 1-2 天

### Phase 1: 核心功能 (优先级最高) ⚡
**目标**: 让系统能够自动检测语言并生成对应语言的 notes

**任务清单**:
- [x] 创建语言检测工具 (`lib/languageDetection.ts`)
- [ ] 修改文件处理 API (`app/api/process/file/route.ts`)
  - [ ] 集成语言检测
  - [ ] 集成教育模式
  - [ ] 使用本地化 prompt
- [ ] 修改音频处理 API (`app/api/process/audio/route.ts`)
  - [ ] **保持 Whisper 多语言识别** (不限制语言)
  - [ ] 检测转录文本语言
  - [ ] 集成教育模式
- [ ] 修改视频处理 API (`app/api/process/video/route.ts`)
  - [ ] 集成语言检测
  - [ ] 集成教育模式
- [ ] 更新 Session 类型，添加语言和教育模式字段 (`types/notra.ts`)
- [ ] 在生成 prompt 中使用检测到的语言和教育模式

**预计时间**: 2-3 天

### Phase 2: 语言切换功能 (用户体验) 🎨
**目标**: 允许用户在 notes 界面切换语言并重新生成

**任务清单**:
- [ ] 创建重新生成 API (`app/api/session/[id]/regenerate/route.ts`)
- [ ] 在 notes 详情页添加语言选择器 (`app/dashboard/[id]/page.tsx`)
- [ ] 添加加载状态和错误处理
- [ ] 实现语言缓存机制 (避免重复生成)

**预计时间**: 3-4 天

### Phase 3: Settings 页面功能 (用户控制) ⚙️
**目标**: 允许用户在 Settings 中切换国家和语言，影响整个网站

**任务清单**:
- [ ] 更新 Settings 页面 (`app/settings/page.tsx`)
  - [ ] 添加国家/地区选择器 (使用 `constants/countries.ts`)
  - [ ] 添加语言选择器 (使用 `constants/languages.ts`)
  - [ ] 添加教育模式选择器 (显示当前模式，允许手动覆盖)
  - [ ] 添加保存功能，更新 localStorage
- [ ] 创建 Settings API (`app/api/settings/route.ts`)
  - [ ] GET: 获取用户设置
  - [ ] POST: 更新用户设置
- [ ] 实现设置变更的实时生效
  - [ ] 国家变更 → 自动更新教育模式 → 影响后续生成的 notes
  - [ ] 语言变更 → 立即更新 UI 语言 → 所有页面刷新
- [ ] 添加设置变更提示和确认

**预计时间**: 3-4 天

### Phase 4: UI 界面本地化 (完整体验) 🌍
**目标**: 需要本地化的 UI 文本支持多语言，根据用户选择的语言动态切换

**任务清单**:
- [ ] 创建翻译文件结构 (`locales/`)
- [ ] 创建 i18n 工具函数 (`lib/i18n.ts`)
  - [ ] 从 localStorage 读取 `ui_language`
  - [ ] 添加 `shouldLocalize()` 函数，判断当前页面是否需要本地化
  - [ ] 支持动态切换
- [ ] **本地化 Dashboard** (`app/dashboard/page.tsx`) ✅
- [ ] **本地化 Chat 界面** (`app/chat/page.tsx`) ✅
- [ ] **本地化设置页面** (`app/settings/page.tsx`) ✅
- [ ] **本地化上传页面** (`app/upload/*/page.tsx`) ✅
- [ ] **本地化登录/注册页面** (`app/login/page.tsx`, `app/signup/page.tsx`) ✅
- [ ] **本地化错误消息和提示** (除 Homepage 外) ✅
- [ ] **本地化导航栏** (除 Homepage 外) ✅
- [ ] **保持英文不变**:
  - [ ] Onboarding 流程 (`app/onboarding/**`) - 保持英文 ❌
  - [ ] Homepage (`app/page.tsx`) - 保持英文 ❌
  - [ ] Logo 文字 (`components/NotraLogo.tsx`) - "Notra" 保持英文 ❌
  - [ ] Pricing 页面 Slogan (`app/pricing/page.tsx`) - 核心 slogan 保持英文 ⚠️
- [ ] 实现语言切换时的平滑过渡

**预计时间**: 5-7 天

### Phase 5: Chat 对话语言 (智能对话) 💬
**目标**: Chat 中的 AI 回复使用用户选择的语言

**任务清单**:
- [ ] 修改 Chat API (`app/api/chat/route.ts`)
- [ ] 在系统提示词中指定语言
- [ ] 更新欢迎消息为多语言
- [ ] 处理混合语言对话场景

**预计时间**: 2-3 天

### Phase 6: 优化和增强 (长期) 🚀
**目标**: 提升准确度和用户体验

**任务清单**:
- [ ] 改进语言检测准确度 (使用 ML 模型)
- [ ] 支持混合语言内容检测
- [ ] 添加语言偏好记忆 (记住用户常用语言)
- [ ] 实现智能语言推荐
- [ ] 添加语言切换动画和过渡效果

**预计时间**: 持续优化

---

## 📝 详细实施步骤

### Step 1: 创建 i18n 基础设施

#### 1.1 创建翻译文件结构
```
locales/
├── en/
│   ├── common.json      # 通用文本
│   ├── nav.json         # 导航栏
│   ├── buttons.json     # 按钮文本
│   ├── errors.json      # 错误消息
│   └── chat.json        # Chat 相关
├── zh-CN/
│   ├── common.json
│   ├── nav.json
│   ├── buttons.json
│   ├── errors.json
│   └── chat.json
└── ...
```

#### 1.2 创建 i18n 工具函数 (`lib/i18n.ts`)
```typescript
// 需要保持英文的页面路径
const ENGLISH_ONLY_PAGES = [
  '/',
  '/onboarding',
  '/pricing', // Pricing 页面的 slogan 保持英文
];

// 判断当前页面是否需要本地化
export function shouldLocalize(pathname?: string): boolean {
  if (typeof window === 'undefined') return true;
  
  const path = pathname || window.location.pathname;
  
  // 检查是否在需要保持英文的页面
  for (const englishPage of ENGLISH_ONLY_PAGES) {
    if (path.startsWith(englishPage)) {
      return false;
    }
  }
  
  return true;
}

// 获取用户 UI 语言
export function getUILanguage(): string {
  if (typeof window !== 'undefined') {
    // 如果当前页面不需要本地化，返回英文
    if (!shouldLocalize()) {
      return 'en';
    }
    
    return localStorage.getItem('ui_language') || 
           localStorage.getItem('onboarding_content_language') || 
           'en';
  }
  return 'en';
}

// 获取翻译文本
export function t(key: string, params?: Record<string, string>): string {
  const lang = getUILanguage();
  
  // 如果不需要本地化，尝试从英文翻译文件获取（作为 fallback）
  if (!shouldLocalize() && lang !== 'en') {
    // 在英文页面，即使设置了其他语言，也返回英文
    const translations = require(`@/locales/en/common.json`);
    let text = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    
    return text;
  }
  
  const translations = require(`@/locales/${lang}/common.json`);
  let text = translations[key] || key;
  
  // 替换参数
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  
  return text;
}

// Logo 文字始终返回英文
export function getLogoText(): string {
  return 'Notra'; // 品牌名，始终英文
}
```

### Step 2: 修改内容生成 API

#### 2.1 文件处理 API (`app/api/process/file/route.ts`)
```typescript
import { detectLanguage, getLocalizedPrompt } from '@/lib/languageDetection';
import { getEducationModeByCountry, getEducationModePrompt } from '@/lib/educationMode';

export async function POST(req: Request) {
  // ... 提取文本 ...
  
  // 1. 检测语言
  const detectedLang = detectLanguage(extractedText);
  
  // 2. 获取用户设置的教育模式
  const userCountry = req.headers.get('x-user-country') || 'other';
  const educationMode = getEducationModeByCountry(userCountry);
  
  // 3. 组合 prompt: 语言 + 教育模式
  const languagePrompt = getLocalizedPrompt(detectedLang, 'file')
    .replace('{content}', truncatedText);
  const modePrompt = getEducationModePrompt(educationMode, detectedLang);
  const fullPrompt = `${modePrompt}\n\n${languagePrompt}`;
  
  // 4. 生成内容
  const structuredContent = await generateStructuredContent(fullPrompt);
  
  // 5. 创建 session，保存语言和教育模式
  const newSession = await createSession({
    type: "file",
    title: structuredContent.title,
    contentHash,
    notes: structuredContent.notes,
    quizzes: structuredContent.quizzes,
    flashcards: structuredContent.flashcards,
    summaryForChat: structuredContent.summaryForChat,
    detectedLanguage: detectedLang,
    generatedLanguage: detectedLang,
    educationMode: educationMode,  // 新增
    originalText: extractedText,  // 保存原始文本用于重新生成
  });
}
```

#### 2.2 音频处理 API (`app/api/process/audio/route.ts`)
```typescript
import { detectLanguage, getLocalizedPrompt } from '@/lib/languageDetection';
import { getEducationModeByCountry, getEducationModePrompt } from '@/lib/educationMode';

// 重要: Whisper API 保持多语言识别，不限制语言
const transcription = await openai.audio.transcriptions.create({
  file: fileForApi,
  model: "whisper-1",
  language: undefined, // 自动检测所有语言 ✅
  prompt: "This is an educational lecture or audio content. Please transcribe accurately.",
});

const transcript = transcription.text;

// 检测转录文本的语言
const detectedLang = detectLanguage(transcript);

// 获取教育模式
const userCountry = req.headers.get('x-user-country') || 'other';
const educationMode = getEducationModeByCountry(userCountry);

// 组合 prompt
const languagePrompt = getLocalizedPrompt(detectedLang, 'audio')
  .replace('{content}', transcript);
const modePrompt = getEducationModePrompt(educationMode, detectedLang);
const fullPrompt = `${modePrompt}\n\n${languagePrompt}`;
```

### Step 3: 创建重新生成 API

#### 3.1 重新生成端点 (`app/api/session/[id]/regenerate/route.ts`)
```typescript
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { targetLanguage } = await req.json();
  const session = await getSessionById(params.id);
  
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  // 获取原始内容 (从 contentHash 或存储的原始文本)
  const originalText = await getOriginalContent(session.contentHash);
  
  // 使用新语言生成
  const prompt = getLocalizedPrompt(targetLanguage, session.type)
    .replace('{content}', originalText);
  
  const newContent = await generateStructuredContent(prompt);
  
  // 更新 session
  await updateSession(params.id, {
    ...newContent,
    generatedLanguage: targetLanguage,
  });
  
  return NextResponse.json({ success: true });
}
```

### Step 4: 更新类型定义

#### 4.1 扩展 Session 类型 (`types/notra.ts`)
```typescript
export interface NotraSession {
  id: string;
  type: SessionType;
  title: string;
  contentHash: string;
  createdAt: string;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
  summaryForChat: string;
  detectedLanguage?: string;      // 新增: 检测到的语言
  generatedLanguage?: string;      // 新增: 实际生成的语言
  educationMode?: 'asian' | 'western' | 'mixed'; // 新增: 教育模式
  originalText?: string;           // 新增: 原始文本 (用于重新生成)
}
```

### Step 5: UI 界面本地化

#### 5.1 创建翻译文件示例 (`locales/en/common.json`)
```json
{
  "nav": {
    "features": "Features",
    "pricing": "Pricing",
    "faq": "FAQ",
    "dashboard": "Dashboard"
  },
  "buttons": {
    "getStarted": "Get Started",
    "goToDashboard": "Go to Dashboard",
    "seeFeatures": "See Features",
    "continue": "Continue",
    "upload": "Upload",
    "generate": "Generate"
  },
  "errors": {
    "fileTooLarge": "File is too large. Maximum size is {maxSize}",
    "unsupportedFormat": "Unsupported file format",
    "uploadFailed": "Upload failed"
  }
}
```

#### 5.2 在组件中使用

**需要本地化的页面** (`app/dashboard/page.tsx`):
```typescript
import { t } from '@/lib/i18n';

export default function Dashboard() {
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
      <Button>{t('buttons.upload')}</Button>
    </div>
  );
}
```

**保持英文的页面** (`app/page.tsx` - Homepage):
```typescript
// Homepage 保持硬编码英文，不使用 t() 函数
const Hero = () => {
  return (
    <section>
      <h1>Turn chaos into structured knowledge.</h1>
      <p>Your AI copilot for academic excellence...</p>
      <Button>Go to Dashboard</Button>
    </section>
  );
};
```

**Logo 组件** (`components/NotraLogo.tsx`):
```typescript
import { getLogoText } from '@/lib/i18n';

export default function NotraLogo({ showText }: { showText?: boolean }) {
  return (
    <div>
      {/* Logo icon */}
      {showText && (
        <span>{getLogoText()}</span> // 始终返回 "Notra"
      )}
    </div>
  );
}
```

**Pricing 页面** (`app/pricing/page.tsx`):
```typescript
// Slogan 保持英文，其他内容可以本地化
export default function PricingPage() {
  return (
    <div>
      {/* 保持英文的 Slogan */}
      <h1>Notes for a new era of learning</h1>
      <p>Notra helps you turn lectures, PDFs, and messy ideas into clean study notes, quizzes, and flashcards – in seconds.</p>
      
      {/* 其他内容可以本地化 */}
      <Button>{t('buttons.getStarted')}</Button>
      <p>{t('pricing.description')}</p>
    </div>
  );
}
```

### Step 6: Settings 页面功能实现

#### 6.1 更新 Settings 页面 (`app/settings/page.tsx`)
```typescript
import { COUNTRIES } from '@/constants/countries';
import { LANGUAGES } from '@/constants/languages';
import { getEducationModeByCountry, getEducationModeDescription, type EducationMode } from '@/lib/educationMode';
import { getUILanguage, t } from '@/lib/i18n';

export default function SettingsPage() {
  const [country, setCountry] = useState<string>('');
  const [uiLanguage, setUILanguage] = useState<string>('en');
  const [contentLanguage, setContentLanguage] = useState<string>('en');
  const [educationMode, setEducationMode] = useState<EducationMode>('western');

  useEffect(() => {
    // 从 localStorage 加载设置
    const savedCountry = localStorage.getItem('onboarding_country') || '';
    const savedUILang = localStorage.getItem('ui_language') || 
                        localStorage.getItem('onboarding_content_language') || 'en';
    const savedContentLang = localStorage.getItem('content_language') || 
                             localStorage.getItem('onboarding_content_language') || 'en';
    
    setCountry(savedCountry);
    setUILanguage(savedUILang);
    setContentLanguage(savedContentLang);
    
    // 根据国家推断教育模式
    const mode = getEducationModeByCountry(savedCountry);
    setEducationMode(mode);
  }, []);

  const handleCountryChange = async (newCountry: string) => {
    setCountry(newCountry);
    localStorage.setItem('onboarding_country', newCountry);
    
    // 自动更新教育模式
    const mode = getEducationModeByCountry(newCountry);
    setEducationMode(mode);
    localStorage.setItem('education_mode', mode);
    
    // 保存到后端 (可选)
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ country: newCountry, educationMode: mode }),
    });
    
    // 提示用户: 后续生成的 notes 将使用新模式
    alert(t('settings.countryChanged', { mode: getEducationModeDescription(mode, uiLanguage) }));
  };

  const handleUILanguageChange = async (newLang: string) => {
    setUILanguage(newLang);
    localStorage.setItem('ui_language', newLang);
    
    // 立即刷新页面以应用新语言
    window.location.reload();
  };

  const handleContentLanguageChange = async (newLang: string) => {
    setContentLanguage(newLang);
    localStorage.setItem('content_language', newLang);
    
    // 保存到后端
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ contentLanguage: newLang }),
    });
    
    // 提示: 后续生成的 notes 将使用新语言
    alert(t('settings.contentLanguageChanged'));
  };

  return (
    <div>
      {/* 国家选择 */}
      <div>
        <label>{t('settings.country')}</label>
        <select value={country} onChange={(e) => handleCountryChange(e.target.value)}>
          {COUNTRIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <p>{getEducationModeDescription(educationMode, uiLanguage)}</p>
      </div>

      {/* UI 语言选择 */}
      <div>
        <label>{t('settings.uiLanguage')}</label>
        <select value={uiLanguage} onChange={(e) => handleUILanguageChange(e.target.value)}>
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.code || lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
        <p>{t('settings.uiLanguageHint')}</p>
      </div>

      {/* 内容语言选择 */}
      <div>
        <label>{t('settings.contentLanguage')}</label>
        <select value={contentLanguage} onChange={(e) => handleContentLanguageChange(e.target.value)}>
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.code || lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
        <p>{t('settings.contentLanguageHint')}</p>
      </div>

      {/* 教育模式 (显示当前模式，允许手动覆盖) */}
      <div>
        <label>{t('settings.educationMode')}</label>
        <select value={educationMode} onChange={(e) => {
          const mode = e.target.value as EducationMode;
          setEducationMode(mode);
          localStorage.setItem('education_mode', mode);
        }}>
          <option value="asian">{t('settings.mode.asian')}</option>
          <option value="western">{t('settings.mode.western')}</option>
          <option value="mixed">{t('settings.mode.mixed')}</option>
        </select>
        <p>{getEducationModeDescription(educationMode, uiLanguage)}</p>
      </div>
    </div>
  );
}
```

### Step 7: Notes 界面语言切换器

#### 7.1 在详情页添加语言选择器 (`app/dashboard/[id]/page.tsx`)
```typescript
const [selectedLanguage, setSelectedLanguage] = useState(session.generatedLanguage || 'en');
const [isRegenerating, setIsRegenerating] = useState(false);

const handleLanguageChange = async (newLang: string) => {
  if (newLang === selectedLanguage) return;
  
  setIsRegenerating(true);
  try {
    const res = await fetch(`/api/session/${sessionId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLanguage: newLang }),
    });
    
    if (res.ok) {
      // 重新加载 session
      await fetchSession();
      setSelectedLanguage(newLang);
    }
  } catch (error) {
    console.error('Failed to regenerate:', error);
  } finally {
    setIsRegenerating(false);
  }
};

// 在 UI 中
<LanguageSelector
  value={selectedLanguage}
  onChange={handleLanguageChange}
  disabled={isRegenerating}
/>
```

---

## 📁 文件结构

### 新增文件
```
lib/
├── languageDetection.ts    ✅ (已创建)
├── educationMode.ts        ✅ (已创建)
├── i18n.ts                 (待创建)
└── languageCache.ts        (待创建 - 缓存机制)

locales/                    (待创建)
├── en/
│   ├── common.json
│   ├── nav.json
│   ├── buttons.json
│   ├── errors.json
│   └── chat.json
├── zh-CN/
│   └── ...
└── ...

app/api/
├── settings/
│   └── route.ts            (待创建 - Settings API)
└── session/
    └── [id]/
        └── regenerate/
            └── route.ts    (待创建)

components/
└── LanguageSelector.tsx    (待创建)
```

### 需要修改的文件

**需要本地化的文件**:
```
types/notra.ts              (添加语言字段)
app/api/process/file/route.ts
app/api/process/audio/route.ts
app/api/process/video/route.ts
app/api/chat/route.ts
app/dashboard/page.tsx      ✅ 需要本地化
app/dashboard/[id]/page.tsx ✅ 需要本地化
app/chat/page.tsx           ✅ 需要本地化
app/settings/page.tsx        ✅ 需要本地化
app/upload/file/page.tsx    ✅ 需要本地化
app/upload/audio/page.tsx   ✅ 需要本地化
app/upload/video/page.tsx   ✅ 需要本地化
app/login/page.tsx          ✅ 需要本地化
app/signup/page.tsx         ✅ 需要本地化
```

**保持英文不变的文件**:
```
app/page.tsx                ❌ 保持英文 (Homepage)
app/onboarding/**           ❌ 保持英文 (所有 onboarding 页面)
app/pricing/page.tsx        ⚠️ 部分保持英文 (Slogan 保持英文，其他可本地化)
components/NotraLogo.tsx    ❌ Logo 文字保持英文
```

---

## 🔄 数据流

### 内容生成流程
```
用户上传文件/录音/视频
    ↓
提取文本内容
    ↓
detectLanguage(text) → 检测语言 (如: 'zh-CN')
    ↓
从 localStorage 获取用户设置:
  - country → 推断 educationMode (如: 'asian')
  - contentLanguage (可选，默认使用检测到的语言)
    ↓
组合 prompt:
  - getEducationModePrompt('asian', 'zh-CN') → 教育模式提示
  - getLocalizedPrompt('zh-CN', 'file') → 语言提示
    ↓
调用 LLM API (使用组合 prompt)
    ↓
生成中文 notes (亚洲教育风格)
    ↓
保存到 Session {
  detectedLanguage: 'zh-CN',
  generatedLanguage: 'zh-CN',
  educationMode: 'asian',
  notes: [...中文内容，亚洲风格...]
}
```

### 语言切换流程
```
用户在 notes 界面选择新语言 (如: 'en')
    ↓
调用 /api/session/[id]/regenerate
    ↓
从 Session 获取 originalText
    ↓
getLocalizedPrompt('en', 'file') → 生成英文 prompt
    ↓
调用 LLM API (使用英文 prompt)
    ↓
更新 Session {
  generatedLanguage: 'en',
  notes: [...英文内容...]
}
    ↓
前端重新渲染 notes
```

### Settings 变更流程

#### 国家变更流程
```
用户在 Settings 选择新国家 (如: 'japan')
    ↓
getEducationModeByCountry('japan') → 'asian'
    ↓
localStorage.setItem('onboarding_country', 'japan')
localStorage.setItem('education_mode', 'asian')
    ↓
提示用户: "教育模式已更新为亚洲模式"
    ↓
后续生成的 notes 将使用亚洲教育风格
```

#### UI 语言切换流程
```
用户在 Settings 选择 UI 语言 (如: 'zh-CN')
    ↓
localStorage.setItem('ui_language', 'zh-CN')
    ↓
触发页面重新加载 (window.location.reload())
    ↓
所有组件使用 t() 函数获取翻译
    ↓
显示中文界面
```

#### 内容语言变更流程
```
用户在 Settings 选择内容语言 (如: 'en')
    ↓
localStorage.setItem('content_language', 'en')
    ↓
提示用户: "后续生成的 notes 将使用英文"
    ↓
下次上传文件时，优先使用用户选择的语言
    (如果检测到的语言与用户选择不同，可提示用户)
```

---

## 💰 成本分析

### API 调用成本

| 操作 | 成本 | 频率 | 月成本估算 |
|------|------|------|-----------|
| 语言检测 | ~$0 | 每次上传 | $0 |
| 初始生成 notes | $0.01-0.05 | 每次上传 | 取决于用户量 |
| 重新生成 notes | $0.01-0.05 | 用户主动触发 | 较低 (按需) |
| Whisper 转录 | $0.006/分钟 | 每次录音 | 取决于使用量 |

### 存储成本

- **翻译文件**: 几乎为 0 (静态文件)
- **语言缓存**: 可忽略 (内存缓存)

### 总体成本评估

- **Phase 1-2**: 几乎无额外成本 (语言检测是本地计算)
- **Phase 3**: 无额外成本 (只是静态翻译文件)
- **重新生成**: 按需触发，用户主动操作，成本可控

**建议**: 
- 添加使用限制 (免费用户每月可重新生成 X 次)
- Pro 用户无限制

---

## ⚠️ 风险评估

### 技术风险

1. **语言检测准确度**
   - **风险**: 简单规则检测可能不够准确
   - **缓解**: Phase 1 先用简单方案，Phase 5 升级到 ML 模型

2. **混合语言内容**
   - **风险**: 中英混合、代码+注释等难以处理
   - **缓解**: 检测到混合时，以主要语言为准，或让用户选择

3. **重新生成成本**
   - **风险**: 用户频繁切换语言导致成本增加
   - **缓解**: 添加缓存机制，相同语言+内容不重复生成

### 用户体验风险

1. **语言切换延迟**
   - **风险**: 重新生成需要时间，用户等待体验差
   - **缓解**: 显示加载状态，预估时间，考虑后台预生成常用语言

2. **翻译质量**
   - **风险**: AI 生成的翻译可能不够准确
   - **缓解**: 在 prompt 中强调准确性，后续可添加人工审核

### 实施风险

1. **代码重构工作量**
   - **风险**: UI 本地化需要修改大量文件
   - **缓解**: 分阶段实施，先做核心功能，UI 本地化可以逐步推进

2. **维护成本**
   - **风险**: 新增功能需要添加多语言支持
   - **缓解**: 建立翻译流程，使用工具函数统一管理

---

## ✅ 实施检查清单

### Phase 0 检查清单
- [x] 语言检测工具完成
- [x] 教育模式系统完成
- [ ] Session 类型添加语言和教育模式字段
- [ ] Settings API 完成

### Phase 1 检查清单
- [x] 语言检测工具完成
- [ ] 所有内容生成 API 集成语言检测
- [ ] 所有内容生成 API 集成教育模式
- [ ] **测试: Whisper 保持多语言识别** (录音功能)
- [ ] Session 类型添加语言和教育模式字段
- [ ] 测试: 上传中文文件 → 生成中文 notes (亚洲模式)
- [ ] 测试: 上传英文文件 → 生成英文 notes (欧美模式)

### Phase 2 检查清单
- [ ] 重新生成 API 完成
- [ ] Notes 界面添加语言选择器
- [ ] 语言缓存机制实现
- [ ] 测试: 切换语言 → 重新生成成功
- [ ] 测试: 错误处理和加载状态

### Phase 3 检查清单
- [ ] Settings 页面添加国家选择器
- [ ] Settings 页面添加语言选择器 (UI + Content)
- [ ] Settings 页面添加教育模式显示和选择
- [ ] Settings API 完成 (GET/POST)
- [ ] 测试: 切换国家 → 教育模式自动更新
- [ ] 测试: 切换 UI 语言 → 页面立即刷新
- [ ] 测试: 切换内容语言 → 后续生成使用新语言

### Phase 4 检查清单
- [ ] 翻译文件结构创建
- [ ] i18n 工具函数完成（包含 `shouldLocalize()` 函数）
- [ ] **Dashboard 本地化完成** ✅
- [ ] **Chat 界面本地化完成** ✅
- [ ] **设置页面本地化完成** ✅
- [ ] **上传页面本地化完成** ✅
- [ ] **登录/注册页面本地化完成** ✅
- [ ] **确认 Homepage 保持英文** ❌
- [ ] **确认 Onboarding 保持英文** ❌
- [ ] **确认 Logo 文字保持英文** ❌
- [ ] **确认 Pricing Slogan 保持英文** ⚠️
- [ ] 测试: 在 Dashboard 切换 UI 语言 → 文本更新
- [ ] 测试: 在 Homepage → 文本保持英文
- [ ] 测试: 在 Onboarding → 文本保持英文

### Phase 4 检查清单
- [ ] Chat API 集成语言设置
- [ ] 系统提示词本地化
- [ ] 欢迎消息多语言
- [ ] 测试: Chat 对话使用正确语言

---

## 🎯 成功指标

### 技术指标
- ✅ 语言检测准确度 > 85%
- ✅ 重新生成成功率 > 95%
- ✅ API 响应时间 < 3秒 (重新生成)

### 用户体验指标
- ✅ 用户满意度提升
- ✅ 多语言用户使用率增加
- ✅ 语言切换功能使用率 > 30%

### 业务指标
- ✅ 成本控制在预算内
- ✅ 无重大 bug 或性能问题

---

## 📚 参考资料

- [OpenAI Whisper API 文档](https://platform.openai.com/docs/guides/speech-to-text)
- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [ISO 639-1 语言代码](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

**最后更新**: 2024-12-19
**版本**: 1.0
**状态**: 规划阶段

