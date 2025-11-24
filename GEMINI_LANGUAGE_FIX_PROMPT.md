# Gemini 语言切换系统修复提示词

## 📋 任务概述

你需要在现有的 GitHub 仓库基础上，修复 Notra 网站的语言切换系统。主要任务包括：
1. 修复 Settings 页面中语言和国家选择器的下拉菜单被 Notification 区域遮挡的问题
2. 确保语言切换功能在所有页面正常工作
3. 确保所有 21 种语言都能正确切换

## 🔗 GitHub 仓库信息

**仓库地址**: `https://github.com/Christian857-yang/Notra-ai-5.git`

**分支**: `main`

## 🎯 核心问题

### 问题 1: 下拉菜单被遮挡
- **现象**: Settings 页面中，点击"Language / 语言"或"Country / Region / 国家/地区"选择器时，下拉菜单被下方的 "Notifications" 区域遮挡
- **位置**: `app/settings/page.tsx` 的 Preferences Section
- **相关组件**: 
  - `components/LanguageSwitcher.tsx`
  - `components/CountrySwitcher.tsx`

### 问题 2: 语言切换不生效
- **现象**: 在 Settings 页面切换语言后，整个网站没有任何变化，仍然显示英文
- **可能原因**: 
  - 语言代码映射不一致（`zh-cn` vs `zh-CN`）
  - 翻译文件未正确加载
  - 页面未正确刷新

## 📁 关键文件位置

### 1. 语言切换组件
- `components/LanguageSwitcher.tsx` - 语言选择器组件
- `components/CountrySwitcher.tsx` - 国家选择器组件

### 2. 翻译系统
- `lib/i18n.ts` - 翻译核心逻辑
- `locales/en/common.json` - 英文翻译文件
- `locales/zh-CN/common.json` - 简体中文翻译文件
- `locales/*/common.json` - 其他 19 种语言的翻译文件

### 3. Settings 页面
- `app/settings/page.tsx` - 设置页面主文件

### 4. Dashboard 页面
- `app/dashboard/page.tsx` - 仪表板页面（已部分本地化）

### 5. 语言常量
- `constants/languages.ts` - 语言列表定义（21 种语言）

## 🔧 技术细节

### 语言代码格式
- **Onboarding 保存格式**: `zh-cn` (小写，带连字符)
- **翻译文件键**: `zh-CN` (大写，带连字符)
- **映射关系**: 在 `lib/i18n.ts` 的 `LANGUAGE_MAP` 中定义

### 当前实现状态
- ✅ 已创建所有 21 种语言的翻译文件（目前只有 en 和 zh-CN 有实际翻译，其他是英文副本）
- ✅ 已创建 LanguageSwitcher 和 CountrySwitcher 组件
- ✅ Dashboard 页面已使用 `t()` 函数进行本地化
- ✅ Settings 页面已集成语言选择器
- ❌ 下拉菜单 z-index 不够高，被遮挡
- ❌ 语言切换后页面不刷新或翻译不生效

## 🛠️ 修复方案

### 修复 1: 下拉菜单被遮挡问题

**问题分析**:
- 当前下拉菜单使用 `absolute` 定位，z-index 为 `z-[9999]`
- 但可能被父容器的 `overflow` 或 `z-index` 限制

**解决方案**:
1. **使用 Portal 渲染下拉菜单**（推荐）
   - 使用 React Portal 将下拉菜单渲染到 `document.body`
   - 这样可以完全脱离父容器的限制
   - 使用 `createPortal` from `react-dom`

2. **或者提高 z-index 并添加 backdrop**
   - 确保下拉菜单的 z-index 足够高（如 `z-[99999]`）
   - 添加半透明 backdrop 层，点击外部关闭
   - 确保父容器没有 `overflow: hidden`

**具体实现** (方案 1 - Portal):

在 `components/LanguageSwitcher.tsx` 中：
```typescript
import { createPortal } from 'react-dom';

// 在组件中
{isOpen && typeof window !== 'undefined' && createPortal(
  <>
    {/* Backdrop */}
    <div 
      className="fixed inset-0 z-[99998] bg-black/20" 
      onClick={() => setIsOpen(false)}
    />
    {/* Dropdown Menu */}
    <div 
      className="fixed z-[99999] bg-white dark:bg-[#0B0C15] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
      style={{
        top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 0,
        left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 0,
        width: buttonRef.current ? buttonRef.current.offsetWidth : 'auto',
      }}
    >
      {/* 下拉菜单内容 */}
    </div>
  </>,
  document.body
)}
```

同样修改 `components/CountrySwitcher.tsx`

### 修复 2: 语言切换不生效问题

**问题分析**:
- 语言代码格式不一致（`zh-cn` vs `zh-CN`）
- `getUILanguage()` 可能返回错误的格式
- 翻译文件可能未正确加载

**解决方案**:

1. **统一语言代码格式**
   - 在 `lib/i18n.ts` 的 `getUILanguage()` 中，确保返回小写格式（如 `zh-cn`）
   - 在 `getTranslations()` 中，使用 `LANGUAGE_MAP` 正确映射

2. **确保翻译文件正确加载**
   - 检查所有语言的静态导入是否正确
   - 确保 `getNestedValue()` 函数能正确解析嵌套键

3. **添加调试日志**
   - 在 `t()` 函数中添加 console.log，显示当前语言和翻译结果
   - 帮助诊断问题

4. **确保页面刷新**
   - 在 Settings 的 `handleUILanguageChange` 中，确保调用 `window.location.reload()`
   - 添加延迟确保 localStorage 已保存

**具体实现**:

在 `lib/i18n.ts` 中：
```typescript
export function getUILanguage(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }

  if (!shouldLocalize()) {
    return 'en';
  }

  let uiLang = localStorage.getItem('ui_language') ||
               localStorage.getItem('onboarding_content_language') ||
               'en';

  if (uiLang === 'other') {
    return 'en';
  }

  // 强制转换为小写，统一格式
  uiLang = uiLang.toLowerCase();
  
  // Debug log
  console.log('[i18n] getUILanguage:', uiLang, {
    ui_language: localStorage.getItem('ui_language'),
    onboarding_content_language: localStorage.getItem('onboarding_content_language'),
  });
  
  return uiLang;
}
```

在 `lib/i18n.ts` 的 `t()` 函数中：
```typescript
export function t(key: string, params?: Record<string, string>): string {
  const lang = getUILanguage();
  const normalizedLang = LANGUAGE_MAP[lang] || lang || 'en';

  try {
    const translations = getTranslations(normalizedLang);
    let text: string | undefined = getNestedValue(translations, key);
    
    // Debug log
    if (!text || text === key) {
      console.warn(`[i18n] Translation not found: key="${key}", lang="${lang}", normalized="${normalizedLang}"`);
    }
    
    // Fallback to English
    if (!text || text === key) {
      if (normalizedLang !== 'en') {
        const enTranslations = getTranslations('en');
        text = getNestedValue(enTranslations, key);
      }
    }
    
    if (!text || text === key) {
      text = key;
    }

    let result = typeof text === 'string' ? text : key;

    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }

    return result;
  } catch (error) {
    console.error(`[i18n] Translation error:`, error);
    return key;
  }
}
```

## 📝 实施步骤

### Step 1: 修复下拉菜单遮挡问题
1. 修改 `components/LanguageSwitcher.tsx`
   - 添加 `useRef` 来获取按钮位置
   - 使用 `createPortal` 渲染下拉菜单到 `document.body`
   - 计算按钮位置，动态设置下拉菜单位置

2. 修改 `components/CountrySwitcher.tsx`
   - 同样的 Portal 方案

### Step 2: 修复语言切换逻辑
1. 修改 `lib/i18n.ts`
   - 确保 `getUILanguage()` 返回统一格式（小写）
   - 添加调试日志
   - 确保 `LANGUAGE_MAP` 正确映射

2. 修改 `app/settings/page.tsx`
   - 确保 `handleUILanguageChange` 正确保存语言代码
   - 确保页面刷新逻辑正确

### Step 3: 测试验证
1. 测试下拉菜单不被遮挡
2. 测试语言切换后页面刷新
3. 测试翻译是否正确显示
4. 测试所有 21 种语言

## 🎯 预期结果

修复后应该：
1. ✅ 下拉菜单显示在最上层，不被任何元素遮挡
2. ✅ 点击语言选择后，页面自动刷新
3. ✅ 刷新后，所有使用 `t()` 函数的文本都显示为选择的语言
4. ✅ 支持所有 21 种语言切换

## 📌 注意事项

1. **不要修改的文件**:
   - `app/page.tsx` (Homepage) - 保持英文
   - `app/onboarding/**` - 保持英文
   - `app/pricing/page.tsx` - Slogan 保持英文
   - Logo 文字 - 保持 "Notra"

2. **需要本地化的页面**:
   - `app/dashboard/page.tsx` ✅ (已部分完成)
   - `app/settings/page.tsx` ✅ (已部分完成)
   - `app/chat/page.tsx` (待完成)
   - `app/upload/**` (待完成)
   - `app/login/page.tsx` (待完成)
   - `app/signup/page.tsx` (待完成)

3. **语言代码一致性**:
   - 始终使用 `lang.id` (如 `zh-cn`)，不要使用 `lang.code` (如 `zh-CN`)
   - 在 `LANGUAGE_MAP` 中统一映射

## 🔍 调试方法

如果语言切换仍不生效，检查：
1. 浏览器控制台是否有错误
2. `localStorage.getItem('ui_language')` 的值
3. `getUILanguage()` 的返回值
4. `t('dashboard.title')` 的返回值
5. 翻译文件是否正确加载

## 📚 参考文件

- `docs/LANGUAGE_IMPLEMENTATION_STRATEGY.md` - 完整的语言实施策略文档
- `constants/languages.ts` - 语言列表定义
- `lib/educationMode.ts` - 教育模式相关逻辑

---

**重要**: 请仔细阅读现有代码，理解当前的实现方式，然后进行修复。确保不破坏现有功能，只修复问题。

