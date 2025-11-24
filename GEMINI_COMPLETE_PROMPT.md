# Gemini 完整修复提示词 - Notra 语言切换系统

## 📋 任务背景

你需要在现有的 GitHub 仓库基础上，修复 Notra 网站的语言切换系统。这是一个 Next.js + TypeScript + React 项目，使用 Tailwind CSS 进行样式设计。

## 🔗 GitHub 仓库信息

**仓库地址**: `https://github.com/Christian857-yang/Notra-ai-5.git`  
**分支**: `main`  
**框架**: Next.js 16 (App Router)  
**语言**: TypeScript  
**样式**: Tailwind CSS

## 🎯 需要修复的两个核心问题

### 问题 1: 下拉菜单被 Notification 区域遮挡

**现象描述**:
- 在 Settings 页面 (`app/settings/page.tsx`)
- 点击"Language / 语言"选择器时，下拉菜单被下方的 "Notifications" 区域遮挡
- 点击"Country / Region / 国家/地区"选择器时，同样被遮挡
- 用户无法看到完整的语言/国家列表

**问题原因**:
- 下拉菜单使用 `absolute` 定位，z-index 为 `z-[9999]`
- 但被父容器或其他元素的 z-index 或 overflow 属性限制
- Settings 页面的 section 可能有层级问题

**相关文件**:
- `components/LanguageSwitcher.tsx` (第 175 行左右)
- `components/CountrySwitcher.tsx` (第 113 行左右)
- `app/settings/page.tsx` (第 269-320 行左右)

### 问题 2: 语言切换后网站没有任何变化

**现象描述**:
- 用户在 Settings 页面选择"简体中文"或其他语言
- 页面刷新后，所有文本仍然显示为英文
- Dashboard、Settings 等页面的文本没有变成选择的语言

**问题原因**:
- 语言代码格式不一致：`zh-cn` (小写) vs `zh-CN` (大写)
- `getUILanguage()` 可能返回错误的格式
- 翻译文件可能未正确加载
- `LANGUAGE_MAP` 映射可能不正确

**相关文件**:
- `lib/i18n.ts` (核心翻译逻辑)
- `app/settings/page.tsx` (语言切换处理)
- `app/dashboard/page.tsx` (已使用 t() 函数)

## 📁 项目文件结构

```
notra-website/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard 主页面（已本地化）
│   │   └── [id]/page.tsx         # Notes 详情页
│   ├── settings/
│   │   └── page.tsx              # Settings 页面（需要修复）
│   ├── chat/
│   │   └── page.tsx              # Chat 页面（待本地化）
│   ├── upload/
│   │   ├── file/page.tsx         # 文件上传页（待本地化）
│   │   ├── audio/page.tsx        # 音频上传页（待本地化）
│   │   └── video/page.tsx        # 视频上传页（待本地化）
│   ├── onboarding/               # Onboarding 流程（保持英文）
│   ├── page.tsx                  # Homepage（保持英文）
│   └── pricing/
│       └── page.tsx              # Pricing 页（Slogan 保持英文）
├── components/
│   ├── LanguageSwitcher.tsx      # 语言选择器组件（需要修复）
│   ├── CountrySwitcher.tsx       # 国家选择器组件（需要修复）
│   └── NotraLogo.tsx             # Logo 组件（保持英文）
├── lib/
│   ├── i18n.ts                   # 翻译核心逻辑（需要修复）
│   └── educationMode.ts          # 教育模式逻辑
├── locales/
│   ├── en/
│   │   └── common.json           # 英文翻译
│   ├── zh-CN/
│   │   └── common.json           # 简体中文翻译
│   └── [其他19种语言]/
│       └── common.json           # 其他语言翻译（目前是英文副本）
└── constants/
    ├── languages.ts              # 语言列表定义（21种语言）
    └── countries.ts              # 国家列表定义
```

## 🔧 技术实现细节

### 语言代码格式规范

**重要**: 语言代码有两种格式，需要统一处理：

1. **Onboarding 和 localStorage 格式**: `zh-cn` (小写，带连字符)
   - 来源: `constants/languages.ts` 中的 `lang.id`
   - 保存位置: `localStorage.getItem('ui_language')`

2. **翻译文件键格式**: `zh-CN` (大写，带连字符)
   - 来源: `constants/languages.ts` 中的 `lang.code`
   - 文件路径: `locales/zh-CN/common.json`

3. **映射关系**: 在 `lib/i18n.ts` 的 `LANGUAGE_MAP` 中定义
   ```typescript
   const LANGUAGE_MAP: Record<string, string> = {
     'zh-cn': 'zh-CN',  // localStorage 的 zh-cn -> 翻译文件的 zh-CN
     'zh-tw': 'zh-TW',
     // ... 其他语言
   };
   ```

### 当前实现状态

✅ **已完成**:
- 创建了所有 21 种语言的翻译文件结构
- 创建了 `LanguageSwitcher` 和 `CountrySwitcher` 组件
- Dashboard 页面已使用 `t()` 函数进行本地化
- Settings 页面已集成语言选择器
- 翻译系统支持嵌套键（如 `dashboard.title`）

❌ **待修复**:
- 下拉菜单 z-index 不够高，被遮挡
- 语言切换后页面不刷新或翻译不生效
- 语言代码格式不一致导致翻译加载失败

## 🛠️ 详细修复方案

### 修复方案 1: 下拉菜单被遮挡（使用 React Portal）

**推荐方案**: 使用 React Portal 将下拉菜单渲染到 `document.body`，完全脱离父容器限制。

**修改文件**: `components/LanguageSwitcher.tsx`

**具体步骤**:

1. **导入 createPortal**:
```typescript
import { createPortal } from 'react-dom';
```

2. **添加按钮引用**:
```typescript
const buttonRef = useRef<HTMLButtonElement>(null);
```

3. **修改按钮，添加 ref**:
```typescript
<button
  ref={buttonRef}
  type="button"
  onClick={() => setIsOpen(!isOpen)}
  // ... 其他属性
>
```

4. **使用 Portal 渲染下拉菜单**:
```typescript
{isOpen && typeof window !== 'undefined' && buttonRef.current && createPortal(
  <>
    {/* 半透明背景层，点击关闭 */}
    <div 
      className="fixed inset-0 z-[99998] bg-black/20" 
      onClick={() => setIsOpen(false)}
    />
    
    {/* 下拉菜单 */}
    <div 
      className="fixed z-[99999] bg-white dark:bg-[#0B0C15] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
      style={{
        top: `${buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 8}px`,
        left: `${buttonRef.current.getBoundingClientRect().left + window.scrollX}px`,
        width: `${buttonRef.current.offsetWidth}px`,
        minWidth: '200px',
      }}
    >
      <div className="py-2">
        {availableLanguages.map((lang) => {
          const isSelected = (lang.code || lang.id) === value;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleLanguageChange(lang)}
              className={`
                w-full flex items-center justify-between
                ${currentSize.item}
                text-left
                transition-colors duration-150
                ${isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }
              `}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.label}</span>
                {lang.nativeLabel && lang.nativeLabel !== lang.label && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {lang.nativeLabel}
                  </span>
                )}
              </div>
              {isSelected && (
                <Check className={`${currentSize.icon} text-indigo-600 dark:text-indigo-400`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </>,
  document.body
)}
```

**同样修改**: `components/CountrySwitcher.tsx`，使用相同的 Portal 方案。

### 修复方案 2: 语言切换不生效

**修改文件**: `lib/i18n.ts`

**步骤 1: 修复 `getUILanguage()` 函数**

```typescript
export function getUILanguage(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }

  // If current page shouldn't be localized, always return English
  if (!shouldLocalize()) {
    return 'en';
  }

  // Get language from localStorage
  let uiLang = localStorage.getItem('ui_language') ||
               localStorage.getItem('onboarding_content_language') ||
               'en';

  // Handle 'other' option - default to English
  if (uiLang === 'other') {
    return 'en';
  }

  // 强制转换为小写，统一格式
  uiLang = uiLang.toLowerCase();
  
  // 处理可能的格式变体
  if (uiLang === 'zhcn' || uiLang === 'zh-cn') {
    uiLang = 'zh-cn';
  } else if (uiLang === 'zhtw' || uiLang === 'zh-tw') {
    uiLang = 'zh-tw';
  }
  
  // Debug log (开发环境)
  if (process.env.NODE_ENV === 'development') {
    console.log('[i18n] getUILanguage:', uiLang, {
      ui_language: localStorage.getItem('ui_language'),
      onboarding_content_language: localStorage.getItem('onboarding_content_language'),
      pathname: window.location.pathname,
    });
  }
  
  return uiLang;
}
```

**步骤 2: 修复 `t()` 函数，添加调试和回退**

```typescript
export function t(key: string, params?: Record<string, string>): string {
  const lang = getUILanguage();
  
  // 使用 LANGUAGE_MAP 映射到翻译文件键
  const normalizedLang = LANGUAGE_MAP[lang] || lang || 'en';

  try {
    const translations = getTranslations(normalizedLang);
    let text: string | undefined = getNestedValue(translations, key);
    
    // Debug log (如果翻译未找到)
    if (!text || text === key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Translation not found:`, {
          key,
          lang,
          normalizedLang,
          availableKeys: Object.keys(translations).slice(0, 5),
        });
      }
      
      // Fallback to English
      if (normalizedLang !== 'en') {
        const enTranslations = getTranslations('en');
        text = getNestedValue(enTranslations, key);
      }
    }
    
    // Final fallback to key itself
    if (!text || text === key) {
      text = key;
    }

    let result = typeof text === 'string' ? text : key;

    // Replace parameters
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }

    return result;
  } catch (error) {
    console.error(`[i18n] Translation error:`, error, {
      key,
      lang,
      normalizedLang,
    });
    return key; // Fallback to key
  }
}
```

**步骤 3: 确保 `LANGUAGE_MAP` 完整且正确**

在 `lib/i18n.ts` 中检查 `LANGUAGE_MAP` 是否包含所有 21 种语言：

```typescript
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
```

**步骤 4: 修复 Settings 页面的语言切换处理**

在 `app/settings/page.tsx` 中：

```typescript
const handleUILanguageChange = (lang: string) => {
  // 确保使用 lang.id 格式（小写，如 'zh-cn'）
  // LanguageSwitcher 应该传递 lang.id，但为了安全，这里再规范化一次
  let normalizedLang = lang.toLowerCase();
  
  // 处理可能的格式变体
  if (normalizedLang === 'zh-cn' || normalizedLang === 'zhcn') {
    normalizedLang = 'zh-cn';
  } else if (normalizedLang === 'zh-tw' || normalizedLang === 'zhtw') {
    normalizedLang = 'zh-tw';
  }
  
  // Save to all relevant localStorage keys
  localStorage.setItem('ui_language', normalizedLang);
  localStorage.setItem('content_language', normalizedLang);
  localStorage.setItem('onboarding_content_language', normalizedLang);
  setUILanguage(normalizedLang);
  
  // Debug log
  console.log('[Settings] Language changed to:', normalizedLang);
  console.log('[Settings] localStorage now:', {
    ui_language: localStorage.getItem('ui_language'),
    content_language: localStorage.getItem('content_language'),
    onboarding_content_language: localStorage.getItem('onboarding_content_language'),
  });
  
  // Dispatch custom event for language change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('languagechange'));
  }
  
  // Reload page to apply language change
  // 使用 setTimeout 确保 localStorage 已保存
  setTimeout(() => {
    window.location.reload();
  }, 150);
};
```

**步骤 5: 确保 LanguageSwitcher 传递正确的值**

在 `components/LanguageSwitcher.tsx` 中，确保 `handleLanguageChange` 使用 `lang.id`:

```typescript
const handleLanguageChange = (lang: Language) => {
  if (lang.id === 'other') {
    onChange('en'); // Default to English for 'other'
  } else {
    // 始终使用 lang.id (如 'zh-cn')，不要使用 lang.code (如 'zh-CN')
    onChange(lang.id);
  }
  setIsOpen(false);
};
```

## 📝 完整实施步骤

### Step 1: 修复下拉菜单遮挡问题

1. **修改 `components/LanguageSwitcher.tsx`**:
   - 添加 `import { createPortal } from 'react-dom';`
   - 添加 `const buttonRef = useRef<HTMLButtonElement>(null);`
   - 在按钮上添加 `ref={buttonRef}`
   - 将下拉菜单改为使用 `createPortal` 渲染到 `document.body`
   - 使用 `getBoundingClientRect()` 计算按钮位置
   - 添加半透明 backdrop

2. **修改 `components/CountrySwitcher.tsx`**:
   - 同样的 Portal 方案
   - 确保下拉菜单显示在最上层

### Step 2: 修复语言切换逻辑

1. **修改 `lib/i18n.ts`**:
   - 修复 `getUILanguage()` 函数，确保返回统一的小写格式
   - 修复 `t()` 函数，添加调试日志和回退机制
   - 确保 `LANGUAGE_MAP` 包含所有 21 种语言
   - 确保 `getTranslations()` 正确使用映射

2. **修改 `app/settings/page.tsx`**:
   - 修复 `handleUILanguageChange` 函数
   - 确保语言代码规范化
   - 确保页面刷新逻辑正确

3. **修改 `components/LanguageSwitcher.tsx`**:
   - 确保 `handleLanguageChange` 使用 `lang.id` 而不是 `lang.code`

### Step 3: 测试验证

1. **测试下拉菜单**:
   - 打开 Settings 页面
   - 点击语言选择器，下拉菜单应显示在最上层
   - 点击国家选择器，下拉菜单应显示在最上层
   - 下拉菜单不应被任何元素遮挡

2. **测试语言切换**:
   - 在 Settings 页面选择"简体中文"
   - 页面应自动刷新
   - 刷新后，Dashboard 和 Settings 页面的文本应显示为中文
   - 检查浏览器控制台，应看到调试日志

3. **测试所有语言**:
   - 测试几种主要语言：English, 简体中文, 繁體中文, 日本語, 한국어
   - 确保每种语言都能正确切换

## 🎯 预期结果

修复完成后：

1. ✅ **下拉菜单**:
   - 显示在最上层（z-index 99999）
   - 不被任何元素遮挡
   - 点击外部区域自动关闭
   - 位置正确（在按钮下方）

2. ✅ **语言切换**:
   - 选择语言后页面自动刷新
   - 刷新后所有文本显示为选择的语言
   - 支持所有 21 种语言
   - 浏览器控制台显示调试信息

3. ✅ **翻译系统**:
   - `t('dashboard.title')` 返回正确的翻译
   - `t('settings.title')` 返回正确的翻译
   - 嵌套键（如 `dashboard.createNew`）正确解析

## 📌 重要注意事项

### 不要修改的文件

以下文件/页面必须保持英文，**不要**添加 `t()` 函数：

1. **Homepage**: `app/page.tsx`
   - 整个页面保持英文
   - 包括所有文本、按钮、导航

2. **Onboarding 流程**: `app/onboarding/**`
   - 所有 onboarding 页面保持英文
   - `app/onboarding/step1/page.tsx`
   - `app/onboarding/step2/page.tsx`
   - `app/onboarding/step2-country/page.tsx`
   - `app/onboarding/step2-language/page.tsx`
   - `app/onboarding/step3/page.tsx`
   - `app/onboarding/step4/page.tsx`
   - 等等

3. **Pricing 页面**: `app/pricing/page.tsx`
   - 核心 Slogan 保持英文
   - 其他部分可以本地化（如果需要）

4. **Logo 文字**: `components/NotraLogo.tsx`
   - "Notra" 品牌名称保持英文

### 需要本地化的页面

以下页面应该使用 `t()` 函数进行本地化（部分已完成）：

1. ✅ `app/dashboard/page.tsx` - 已部分完成
2. ✅ `app/settings/page.tsx` - 已部分完成
3. ⏳ `app/chat/page.tsx` - 待完成
4. ⏳ `app/upload/file/page.tsx` - 待完成
5. ⏳ `app/upload/audio/page.tsx` - 待完成
6. ⏳ `app/upload/video/page.tsx` - 待完成
7. ⏳ `app/login/page.tsx` - 待完成
8. ⏳ `app/signup/page.tsx` - 待完成

### 语言代码一致性规则

**重要**: 在整个项目中，必须统一使用 `lang.id` 格式：

- ✅ **正确**: `lang.id` → `'zh-cn'` (小写，带连字符)
- ❌ **错误**: `lang.code` → `'zh-CN'` (大写，可能不一致)

在以下地方必须使用 `lang.id`:
- `LanguageSwitcher` 的 `handleLanguageChange`
- `Settings` 的 `handleUILanguageChange`
- `localStorage.setItem('ui_language', ...)`

## 🔍 调试和验证

### 调试步骤

1. **检查 localStorage**:
   ```javascript
   // 在浏览器控制台输入
   localStorage.getItem('ui_language')
   localStorage.getItem('onboarding_content_language')
   ```

2. **检查翻译函数**:
   ```javascript
   // 在浏览器控制台输入（需要先导入）
   // 或者直接在代码中添加 console.log
   ```

3. **检查语言映射**:
   - 打开 `lib/i18n.ts`
   - 检查 `LANGUAGE_MAP` 是否包含所有语言
   - 检查映射是否正确

4. **检查翻译文件**:
   - 打开 `locales/zh-CN/common.json`
   - 确认 `dashboard.title` 存在且值为 `"仪表板"`
   - 确认所有键都正确

### 验证清单

修复后，请验证：

- [ ] 下拉菜单显示在最上层，不被遮挡
- [ ] 点击语言选择后，页面自动刷新
- [ ] 刷新后，Dashboard 页面显示中文（如果选择了中文）
- [ ] Settings 页面显示中文（如果选择了中文）
- [ ] 浏览器控制台显示调试日志
- [ ] `localStorage.getItem('ui_language')` 返回正确的值
- [ ] 可以切换到其他语言（如日语、韩语等）

## 📚 参考文档

- `docs/LANGUAGE_IMPLEMENTATION_STRATEGY.md` - 完整的语言实施策略
- `constants/languages.ts` - 语言列表定义
- `lib/educationMode.ts` - 教育模式逻辑
- `GEMINI_LANGUAGE_FIX_PROMPT.md` - 简要修复提示词

## 🚀 开始修复

1. **克隆仓库**:
   ```bash
   git clone https://github.com/Christian857-yang/Notra-ai-5.git
   cd Notra-ai-5
   ```

2. **安装依赖**:
   ```bash
   npm install
   ```

3. **按照上述步骤修复代码**

4. **测试**:
   ```bash
   npm run dev
   # 访问 http://localhost:3000/settings
   # 测试语言切换功能
   ```

5. **提交修复**:
   ```bash
   git add .
   git commit -m "修复语言切换系统：下拉菜单遮挡和语言切换不生效问题"
   git push origin main
   ```

---

**重要提示**: 
- 请仔细阅读现有代码，理解当前的实现方式
- 确保不破坏现有功能
- 只修复指定的问题
- 保持代码风格一致
- 添加必要的注释和调试日志

