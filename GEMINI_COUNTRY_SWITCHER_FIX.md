# Gemini 提示词：修复 Settings 页面国家选择器

## 📋 任务概述

你需要在 GitHub 仓库中修复 Settings 页面的国家选择器组件，确保用户可以正常点击并选择国家，同时移除教育模式的显示。

## 🔗 GitHub 仓库信息

**仓库地址**: `https://github.com/christianyzj857-bot/notra-website.git`  
**分支**: `main`  
**框架**: Next.js 16 (App Router)  
**语言**: TypeScript  
**样式**: Tailwind CSS

## 🎯 需要完成的任务

### 任务 1: 修复国家选择器下拉菜单显示问题

**问题描述**:
- 在 Settings 页面 (`app/settings/page.tsx`) 中，国家选择器 (`CountrySwitcher`) 组件点击后下拉菜单不显示
- 用户无法选择国家

**相关文件**:
- `components/CountrySwitcher.tsx` - 国家选择器组件
- `app/settings/page.tsx` - Settings 页面

**要求**:
1. 确保点击国家选择器按钮后，下拉菜单能够正常显示
2. 下拉菜单应该显示所有可用的国家（来自 `constants/countries.ts` 的 `COUNTRIES` 数组）
3. 包括 "Other" 选项
4. 下拉菜单使用 React Portal 渲染到 `document.body`，确保不被其他元素遮挡
5. 下拉菜单的 z-index 应该足够高（建议 `z-[99999]`）
6. 点击外部区域或选择国家后，下拉菜单应该关闭

### 任务 2: 移除教育模式显示

**问题描述**:
- 在 Settings 页面的国家选择器下方，显示了 "Education Mode: Western Style" 文本
- 用户要求移除这个显示

**相关文件**:
- `app/settings/page.tsx` - 第 277-281 行左右

**要求**:
1. 删除显示教育模式的代码块：
   ```tsx
   {educationMode && (
     <p className="text-xs text-slate-400 mt-2">
       {t('settings.educationMode')}: {t(`settings.mode.${educationMode.toLowerCase()}`)}
     </p>
   )}
   ```
2. 保留 `educationMode` 状态和逻辑（用于后续可能的功能），只是不显示给用户

## 📁 关键文件位置

### 1. `components/CountrySwitcher.tsx`
- 国家选择器组件
- 应该使用 `createPortal` 渲染下拉菜单
- 下拉菜单应该包含所有 `COUNTRIES` 数组中的国家

### 2. `app/settings/page.tsx`
- Settings 页面
- 第 270-281 行左右：国家选择器部分
- 需要删除教育模式显示

### 3. `constants/countries.ts`
- 国家列表定义
- `COUNTRIES` 数组包含所有可用国家，包括 `{ id: 'other', label: 'Other', code: 'XX' }`

## 🔧 技术实现细节

### 国家选择器组件要求

1. **下拉菜单渲染**:
   - 使用 `createPortal` from 'react-dom' 将下拉菜单渲染到 `document.body`
   - 确保下拉菜单在正确的 z-index 层级

2. **位置计算**:
   - 使用 `getBoundingClientRect()` 计算按钮位置
   - 下拉菜单应该显示在按钮下方
   - 考虑滚动位置：`top: rect.bottom + window.scrollY + 4`

3. **点击处理**:
   - 按钮点击应该切换 `isOpen` 状态
   - 点击外部区域（透明遮罩层）应该关闭下拉菜单
   - 选择国家后应该调用 `onChange` 并关闭下拉菜单

4. **样式要求**:
   - 下拉菜单背景：`bg-white dark:bg-[#0B0C15]`
   - 边框：`border border-slate-200 dark:border-white/10`
   - 圆角：`rounded-xl`
   - 阴影：`shadow-2xl`
   - 最大高度：`max-h-96`，超出部分可滚动

### 参考实现

可以参考 `components/LanguageSwitcher.tsx` 的实现方式（如果存在），使用相同的 Portal 模式。

## 📝 实施步骤

### Step 1: 检查并修复 CountrySwitcher 组件

1. 打开 `components/CountrySwitcher.tsx`
2. 确保：
   - 导入了 `createPortal` from 'react-dom'
   - 使用 `useRef` 获取按钮引用
   - 在 `onClick` 中正确切换 `isOpen` 状态
   - 使用 Portal 渲染下拉菜单到 `document.body`
   - 位置计算逻辑正确
   - z-index 足够高

### Step 2: 移除教育模式显示

1. 打开 `app/settings/page.tsx`
2. 找到国家选择器下方的教育模式显示代码（约第 277-281 行）
3. 删除整个 `{educationMode && (...)}` 代码块
4. 保留 `educationMode` 状态变量（不删除状态定义）

### Step 3: 测试验证

1. 确保国家选择器可以点击
2. 确保下拉菜单正常显示
3. 确保可以选择所有国家，包括 "Other"
4. 确保教育模式文本不再显示
5. 确保下拉菜单不被其他元素遮挡

## 🎯 预期结果

修复完成后：

1. ✅ **国家选择器功能正常**:
   - 点击按钮后下拉菜单立即显示
   - 下拉菜单显示所有国家选项（包括 "Other"）
   - 可以选择任意国家
   - 选择后下拉菜单关闭

2. ✅ **下拉菜单显示正确**:
   - 位置在按钮下方
   - 不被任何元素遮挡
   - 样式美观，符合设计规范

3. ✅ **教育模式已移除**:
   - Settings 页面不再显示 "Education Mode: Western Style" 文本
   - 但 `educationMode` 状态和逻辑保留（不删除相关代码）

## 📌 重要注意事项

1. **不要删除 `educationMode` 状态**:
   - 只删除显示部分，保留状态变量和 `getEducationModeByCountry` 函数调用
   - 这些可能在后续功能中需要

2. **确保下拉菜单可访问**:
   - 使用 Portal 确保下拉菜单在最上层
   - z-index 应该足够高（`z-[99999]`）

3. **保持代码风格一致**:
   - 使用 Tailwind CSS 类名
   - 遵循现有的代码风格和命名规范

4. **测试所有国家**:
   - 确保所有 `COUNTRIES` 数组中的国家都能正常显示和选择
   - 包括 "Other" 选项

## 🚀 开始修复

1. **克隆仓库**:
   ```bash
   git clone https://github.com/christianyzj857-bot/notra-website.git
   cd notra-website
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
   # 测试国家选择器功能
   ```

5. **提交修复**:
   ```bash
   git add .
   git commit -m "修复Settings页面国家选择器:确保下拉菜单正常显示,移除教育模式显示"
   git push origin main
   ```

---

**重要提示**: 
- 请仔细阅读现有代码，理解当前的实现方式
- 确保不破坏现有功能
- 只修复指定的问题
- 保持代码风格一致
- 添加必要的注释

